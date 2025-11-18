#!/usr/bin/env node
// fikstur_import_simple_updated.mjs
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import minimist from 'minimist';
import fs from 'fs';

const argv = minimist(process.argv.slice(2), { boolean: ['dryRun'], alias: { d: 'dryRun' } });
const FILE = argv.file || argv._[0] || '10.HaftaFikstür.xlsx';
const DRY_RUN = !!argv.dryRun;
const LEAGUE_ID = argv.leagueId ? Number(argv.leagueId) : null; // canonical League.id
const SEASON_ID = argv.seasonId ? Number(argv.seasonId) : null; // Season.id

if (!LEAGUE_ID || !SEASON_ID) {
  console.error('Usage: node fikstur_import_simple_updated.mjs --file="/path/file.xlsx" --leagueId=14 --seasonId=7 [--dryRun]');
  process.exit(1);
}
if (!fs.existsSync(FILE)) {
  console.error('File not found:', FILE);
  process.exit(2);
}

const prisma = new PrismaClient();

// column mapping (unchanged)
const COL = {
  date: 'Tarih',
  week: 'Hafta',
  homeFormation: 'EV Taktik',
  homeName: 'EV',
  homeXg: 'EV xG',
  homeScore: 'EV Skor',
  awayScore: 'DEP Skor',
  awayXg: 'DEP xG',
  awayFormation: 'DEP Taktik',
  awayName: 'DEP',
  notes: 'Takım/Dakika/Olay Notları',
  minute: 'Dakika',
  team: 'Takım',
  playerFN: 'Oyuncu Ad',
  playerLN: 'Oyuncu Soyadı',
  playerPos: 'Oyuncu Pozisyonu',
  playerRating: 'Oyuncu Maç Puanı',
  shotArea: 'Şut Bölgesi',
  shotType: 'Şut Tipi',
  leadUp: 'Pozisyon Gelişimi',
  xG: 'xG Oranı',
  xGOT: 'xGOT Oranı',
  bigChance: 'Büyük Şans',
  outcome: 'Sonuç',
  scoreAtShot: 'Skor',
  assistFN: 'Asist Yapan Oyuncu Adı',
  assistLN: 'Asist Yapan Oyuncu Soyadı'
};

// parsers (unchanged)
const parseNumber = v => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  const cleaned = s.replace(/\s/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};
const parseIntSafe = v => { const n = parseNumber(v); return n === null ? null : Math.round(n); };
const parseDate = v => {
  if (!v && v !== 0) return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const m = s.match(/(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})/);
  if (m) return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T00:00:00Z`);
  return null;
};
const parseBoolNonEmpty = v => (v !== null && v !== undefined && String(v).trim() !== '');

// Prisma model clients (use exact model names from schema)
const clubClient = prisma.club;
const clubSeasonClient = prisma.clubSeason;
const leagueSeasonClient = prisma.leagueSeason;
const fixtureClient = prisma.fixture;
const matchWeekClient = prisma.matchWeek;
const eventClient = prisma.matchEvent;
const gkStatClient = prisma.gkPerf;
const leagueClient = prisma.league;

if (!clubClient || !fixtureClient || !eventClient) {
  console.error('Prisma client missing expected models. Available keys:', Object.keys(prisma).filter(k => !k.startsWith('_')).join(', '));
  process.exit(3);
}

// cache for this run
const fixtureIdByKey = new Map();

// Resolve or create the LeagueSeason for the provided leagueId+seasonId
async function getOrCreateLeagueSeason() {
  const existing = await leagueSeasonClient.findFirst({
    where: { leagueId: LEAGUE_ID, seasonId: SEASON_ID },
    select: { id: true }
  });
  if (existing) return existing.id;

  // need league to infer nation for created clubs later
  const league = await leagueClient.findUnique({ where: { id: LEAGUE_ID }, select: { id: true, nationId: true } });
  if (!league) throw new Error(`League ${LEAGUE_ID} not found`);

  const created = await leagueSeasonClient.create({
    data: { leagueId: LEAGUE_ID, seasonId: SEASON_ID },
    select: { id: true }
  });
  return created.id;
}

// Ensure a MatchWeek exists for (leagueSeasonId, weekNumber).
async function getOrCreateMatchWeek(leagueSeasonId, weekNumber) {
  if (!weekNumber && weekNumber !== 0) return null;
  const raw = String(weekNumber).trim().replace(/[^\d]/g, '');
  if (!raw) return null;
  const w = Number(raw);
  if (!Number.isInteger(w)) return null;

  const found = await matchWeekClient.findFirst({
    where: { leagueSeasonId, weekNumber: w },
    select: { id: true }
  });
  if (found) return found.id;

  try {
    const created = await matchWeekClient.create({
      data: { leagueSeasonId, weekNumber: w },
      select: { id: true }
    });
    return created.id;
  } catch (err) {
    const retry = await matchWeekClient.findFirst({
      where: { leagueSeasonId, weekNumber: w },
      select: { id: true }
    });
    if (retry) return retry.id;
    throw err;
  }
}

// Find or create canonical Club and the ClubSeason for the target LeagueSeason.
// Returns clubSeason.id
async function findOrCreateClubSeasonByName(name, leagueSeasonId, leagueNationId) {
  if (!name) return null;
  const clean = String(name).trim();
  if (!clean) return null;

  // find canonical club by name (case-sensitive exact match). Adapt if you want normalization.
  let club = await clubClient.findFirst({ where: { name: clean }, select: { id: true } });
  if (!club) {
    if (DRY_RUN) {
      // in dry-run, return a fake id
      const fakeId = `dry-club-${Math.random().toString(36).slice(2,8)}`;
      return fakeId;
    }
    // create Club with inferred nation (if available)
    const data = { name: clean, nationId: leagueNationId || undefined };
    club = await clubClient.create({ data, select: { id: true } });
  }
  const clubId = club.id;

  // find or create ClubSeason
  let cs = await clubSeasonClient.findFirst({
    where: { clubId, leagueSeasonId },
    select: { id: true }
  });
  if (!cs) {
    if (DRY_RUN) {
      const fakeId = `dry-clubseason-${Math.random().toString(36).slice(2,8)}`;
      return fakeId;
    }
    try {
      cs = await clubSeasonClient.create({
        data: { clubId, leagueSeasonId },
        select: { id: true }
      });
    } catch (err) {
      // race / unique -> retry
      cs = await clubSeasonClient.findFirst({ where: { clubId, leagueSeasonId }, select: { id: true } });
      if (!cs) throw err;
    }
  }
  return cs.id;
}

async function main() {
  console.log('Start import. dryRun=', DRY_RUN);
  const leagueSeasonId = await getOrCreateLeagueSeason();
  // fetch league to get nationId for creating clubs
  const league = await leagueClient.findUnique({ where: { id: LEAGUE_ID }, select: { nationId: true }});
  const leagueNationId = league ? league.nationId : null;

  const wb = XLSX.readFile(FILE, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  console.log('Rows read:', rows.length);

  const unresolved = [];
  let eventsInserted = 0;

  for (let i = 0; i < rows.length; i++) {
    // process rows; some rows represent GK stats pairs (minute null)
    const row = rows[i];
    try {
      const homeName = row[COL.homeName];
      const awayName = row[COL.awayName];
      const matchDate = parseDate(row[COL.date]);

      // ensure clubSeason ids exist (create clubs if they don't)
      const homeClubSeasonId = await findOrCreateClubSeasonByName(homeName, leagueSeasonId, leagueNationId);
      const awayClubSeasonId = await findOrCreateClubSeasonByName(awayName, leagueSeasonId, leagueNationId);

      if (!homeClubSeasonId || !awayClubSeasonId) {
        unresolved.push({ row: i+1, homeName, homeClubSeasonId, awayName, awayClubSeasonId });
        continue;
      }

      // Build fixture key using clubSeason ids and date (cache within run)
      const keyDate = matchDate ? (new Date(matchDate)).toISOString().slice(0,19) : 'nodate';
      const fixtureKey = `${leagueSeasonId}|${homeClubSeasonId}|${awayClubSeasonId}|${keyDate}`;

      let fixtureId = fixtureIdByKey.get(fixtureKey);
      if (!fixtureId) {
        // try find fixture by leagueSeasonId + clubs + date (if date present)
        let where;
        if (matchDate) {
          where = {
            leagueSeasonId,
            homeClubSeasonId: Number(homeClubSeasonId),
            awayClubSeasonId: Number(awayClubSeasonId),
            date: matchDate
          };
        } else {
          where = {
            leagueSeasonId,
            homeClubSeasonId: Number(homeClubSeasonId),
            awayClubSeasonId: Number(awayClubSeasonId)
          };
        }

        let fixture = null;
        if (!DRY_RUN) {
          fixture = await fixtureClient.findFirst({ where, select: { id: true } });
        }
        if (fixture) {
          fixtureId = fixture.id;
        } else {
          const weekNumber = row[COL.week];
          const matchWeekId = await getOrCreateMatchWeek(leagueSeasonId, weekNumber);

          const fixtureData = {
            leagueSeasonId,
            weekNumber: weekNumber || null,
            matchWeekId: matchWeekId || null,
            date: matchDate,
            notes: row[COL.notes] ?? null,
            homeClubSeasonId: Number(homeClubSeasonId),
            awayClubSeasonId: Number(awayClubSeasonId),
            homeTeamName: homeName ?? null,
            awayTeamName: awayName ?? null,
            homeScore: parseIntSafe(row[COL.homeScore]),
            awayScore: parseIntSafe(row[COL.awayScore]),
            homeXg: parseNumber(row[COL.homeXg]),
            awayXg: parseNumber(row[COL.awayXg]),
            homeFormation: row[COL.homeFormation] ?? null,
            awayFormation: row[COL.awayFormation] ?? null
          };

          if (!DRY_RUN) {
            const created = await fixtureClient.create({ data: fixtureData, select: { id: true } });
            fixtureId = created.id;
          } else {
            console.log('DRY planned fixture (row', i+1, '):', fixtureData);
            fixtureId = `dry-${Math.random().toString(36).slice(2,8)}`;
          }
        }
        fixtureIdByKey.set(fixtureKey, fixtureId);
      }

      // Now process either GK stat pair (minute null) or an event row
      if (row[COL.minute] == null) {
        // assume next row exists and is the away GK row (as in original script)
        const next_row = rows[i + 1] || {};
        // skip the next row as original script did
        i++; // skip next row
        const gkStats = {
          fixtureId,
          homeGkFn: row[COL.playerFN] || null,
          homeGkLn: row[COL.playerLN] || null,
          awayGkFn: next_row[COL.playerFN] || null,
          awayGkLn: next_row[COL.playerLN] || null,
          homeGkRating: parseNumber(row[COL.playerRating]),
          awayGkRating: parseNumber(next_row[COL.playerRating]),
          homeGkSaves: parseNumber(row[COL.bigChance]),
          awayGkSaves: parseNumber(next_row[COL.bigChance]),
        };
        if (!DRY_RUN) {
          try {
            await gkStatClient.create({ data: gkStats });
          } catch (err) {
            if (err.code === 'P2002') {
              console.log(`Duplicate GK skipped (fixture ${fixtureId}, row ${i+1})`);
            } else {
              throw err;
            }
          }
        }
      } else {
        // event row
        const eventPayload = {
          fixtureId,
          minute: parseIntSafe(row[COL.minute]),
          minuteStr: String(row[COL.minute]),
          teamName: row[COL.team] ?? null,
          playerFirstName: row[COL.playerFN] || null,
          playerLastName: row[COL.playerLN] || null,
          playerPos: row[COL.playerPos] ?? null,
          playerRating: parseNumber(row[COL.playerRating]),
          shotArea: row[COL.shotArea] ?? null,
          shotType: row[COL.shotType] ?? null,
          eventLeadUp: row[COL.leadUp] ?? null,
          xG: parseNumber(row[COL.xG]),
          xGOT: parseNumber(row[COL.xGOT]),
          bigChance: parseBoolNonEmpty(row[COL.bigChance]),
          outcome: row[COL.outcome] ?? null,
          score: row[COL.scoreAtShot] ?? null,
          aPlayerFN: row[COL.assistFN] || null,
          aPlayerLN: row[COL.assistLN] || null,
        };
        if (!DRY_RUN) {
          try {
            await eventClient.create({ data: eventPayload });
          } catch (err) {
            if (err.code === 'P2002') {
              console.log(`Duplicate event skipped (fixture ${fixtureId}, row ${i+1})`);
            } else {
              throw err;
            }
          }
        } else {
          if (i < 10) console.log('DRY planned event:', eventPayload);
        }
        eventsInserted++;
      }

    } catch (err) {
      console.error('Row', i+1, 'error:', err && err.message ? err.message : err);
    }
  } // end rows loop

  if (unresolved.length) {
    fs.writeFileSync('unresolved_teams.json', JSON.stringify(unresolved, null, 2), 'utf-8');
    console.log('Wrote unresolved_teams.json entries:', unresolved.length);
  }

  console.log('Done. eventsInserted=', eventsInserted);
  await prisma.$disconnect();
}

main().catch(e => { console.error('Fatal', e); prisma.$disconnect(); process.exit(1); });
