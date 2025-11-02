#!/usr/bin/env node
// fikstur_import_simple.mjs
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';

const argv = minimist(process.argv.slice(2), { boolean: ['dryRun'], alias: { d: 'dryRun' } });
const FILE = argv.file || argv._[0] || '10.HaftaFikstür.xlsx';
const DRY_RUN = !!argv.dryRun;
const LEAGUE_ID = argv.leagueId ? Number(argv.leagueId) : null;
const SEASON_ID = argv.seasonId ? Number(argv.seasonId) : null;

// Set to the exact Prisma client key for your clubs table (likely 'club')
const CLUB_MODEL_NAME = 'club';        // <-- ensure this matches your Prisma client key
const FIXTURE_MODEL_NAME = 'fixture';
const MATCHWEEK_MODEL_NAME = 'matchWeek';
const EVENT_MODEL_NAME = 'matchEvent';

if (!LEAGUE_ID || !SEASON_ID) {
  console.error('Usage: node fikstur_import_simple.mjs --file="/path/file.xlsx" --leagueId=14 --seasonId=7 [--dryRun]');
  process.exit(1);
}
if (!fs.existsSync(FILE)) {
  console.error('File not found:', FILE);
  process.exit(2);
}

const prisma = new PrismaClient();

// Simple mapping: adjust keys if your Excel headers differ
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

// parsers
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

// Ensure a MatchWeek exists for (leagueId, seasonId, weekNumber).
// Returns matchWeek.id or null if weekNumber is falsy.
async function getOrCreateMatchWeek(weekNumber) {
  // normalize weekNumber to integer or null
  if (!weekNumber && weekNumber !== 0) return null;
  const raw = String(weekNumber).trim().replace(/[^\d]/g, '');
  if (!raw) return null;
  const w = Number(raw);
  if (!Number.isInteger(w)) return null;

  // try find first
  const found = await matchWeekClient.findFirst({
    where: { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), weekNumber: w },
    select: { id: true }
  });
  if (found) return found.id;

  // try create, handle race condition gracefully
  try {
    const created = await matchWeekClient.create({
      data: { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), weekNumber: w },
      select: { id: true }
    });
    return created.id;
  } catch (err) {
    // if unique constraint or other race, try to find again
    const retry = await matchWeekClient.findFirst({
      where: { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), weekNumber: w },
      select: { id: true }
    });
    if (retry) return retry.id;
    // otherwise rethrow (unexpected)
    throw err;
  }
}

// minimal helpers that use exact model client names
const clubClient = prisma[CLUB_MODEL_NAME];
const fixtureClient = prisma[FIXTURE_MODEL_NAME];
const matchWeekClient = prisma[MATCHWEEK_MODEL_NAME];
const eventClient = prisma[EVENT_MODEL_NAME];

if (!clubClient || !fixtureClient || !eventClient) {
  console.error('Prisma client does not expose expected models. Check CLUB_MODEL_NAME/FIXTURE_MODEL_NAME/EVENT_MODEL_NAME.');
  console.error('Available keys:', Object.keys(prisma).filter(k => !k.startsWith('_')).join(', '));
  process.exit(3);
}

// find club only (no create)
async function findClubByName(name) {
  if (!name) return null;
  const clean = String(name).trim();
  const found = await clubClient.findFirst({ where: { leagueId: Number(LEAGUE_ID), name: clean }, select: { id: true } });
  return found ? found.id : null;
}

// find matchWeek id if week provided
async function resolveMatchWeekId(week) {
  const w = parseIntSafe(week);
  if (!w) return null;
  const found = await matchWeekClient.findFirst({ where: { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), weekNumber: w } });
  return found ? found.id : null;
}

async function main() {
  console.log('Start import. dryRun=', DRY_RUN);
  const wb = XLSX.readFile(FILE, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  console.log('Rows read:', rows.length);

  const unresolved = [];
  let eventsInserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const homeName = row[COL.homeName];
      const awayName = row[COL.awayName];
      const matchDate = parseDate(row[COL.date]);

      // look up clubs only (assume they exist)
      const homeId = await findClubByName(homeName);
      const awayId = await findClubByName(awayName);

      if (!homeId || !awayId) {
        unresolved.push({ row: i+1, homeName, homeId, awayName, awayId });
        continue;
      }
      // put this **once** before the for-loop (near where you set `const unresolved = []; let eventsInserted = 0;`)
  const fixtureIdByKey = new Map();

// --- inside the for-loop replace the existing find/create fixture code with this block ---
/*
  old block removed here
*/

  const keyDate = matchDate ? (new Date(matchDate)).toISOString().slice(0,19) : 'nodate';
  const fixtureKey = `${LEAGUE_ID}|${SEASON_ID}|${homeId}|${awayId}|${keyDate}`;

// reuse if already resolved in this run
  let fixtureId = fixtureIdByKey.get(fixtureKey);
  if (!fixtureId) {
  // try find in DB first
    const where = matchDate
      ? { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), homeTeamId: Number(homeId), awayTeamId: Number(awayId), date: matchDate }
      : { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), homeTeamId: Number(homeId), awayTeamId: Number(awayId) };

    let fixture = null;
    if (!DRY_RUN) {
    fixture = await fixtureClient.findFirst({ where, select: { id: true } });
    }

    if (fixture) {
      fixtureId = fixture.id;
    } else {
      const weekNumber = row[COL.week];
      const matchWeekId = await getOrCreateMatchWeek(weekNumber);

      const fixtureData = {
        leagueId: Number(LEAGUE_ID),
        seasonId: Number(SEASON_ID),
        weekNumber: weekNumber || null,
        matchWeekId: matchWeekId,
        date: matchDate,
        notes: row[COL.notes] ?? null,
        homeTeamId: Number(homeId),
        awayTeamId: Number(awayId),
        homeTeamName: homeName ?? null,
        awayTeamName: awayName ?? null,
        homeScore: parseIntSafe(row[COL.homeScore]),
        awayScore: parseIntSafe(row[COL.awayScore]),
        homeXg: parseNumber(row[COL.homeXg]),
        awayXg: parseNumber(row[COL.awayXg]),
        homeFormation: row[COL.homeFormation] ?? null, // use formation from the first row only
        awayFormation: row[COL.awayFormation] ?? null
      };

      if (!DRY_RUN) {
        const created = await fixtureClient.create({ data: fixtureData, select: { id: true } });
        fixtureId = created.id;
      } else {
        console.log('DEBUG planned fixture data (row', i+1, '):', JSON.stringify(fixtureData, null, 2));
        fixtureId = `dry-${Math.random().toString(36).slice(2,8)}`; // dry-run placeholder id
      }
    }

  // cache the fixtureId so future rows reuse it
    fixtureIdByKey.set(fixtureKey, fixtureId);
  }

// now fixtureId is available and reused for later event rows

      // event payload
      const eventPayload = {
        fixtureId,
        minute: parseIntSafe(row[COL.minute]),
        minuteStr: String(row[COL.minute]),
        teamName: row[COL.team] ?? null,
        playerFirstName: row[COL.playerFN] || '',
        playerLastName: row[COL.playerLN] || '',
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
        aPlayerFN: row[COL.assistFN] || '',
        aPlayerLN: row[COL.assistLN] || '',
      };
/*
      // debug: print first 5 planned inserts
      if (i < 15) {
        console.log('DEBUG planned event payload (row', i+1, '):', JSON.stringify(eventPayload, null, 2));
      }
*/
      if (!DRY_RUN) {
        await eventClient.create({ data: eventPayload });
      }
      eventsInserted++;

    } catch (err) {
      console.error('Row', i+1, 'error:', err && err.message ? err.message : err);
    }
  }

  if (unresolved.length) {
    fs.writeFileSync('unresolved_teams.json', JSON.stringify(unresolved, null, 2), 'utf-8');
    console.log('Wrote unresolved_teams.json entries:', unresolved.length);
  }

  console.log('Done. eventsInserted=', eventsInserted);
  await prisma.$disconnect();
}

main().catch(e => { console.error('Fatal', e); prisma.$disconnect(); process.exit(1); });
