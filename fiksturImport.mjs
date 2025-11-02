#!/usr/bin/env node
// fiksturImport.mjs
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import minimist from 'minimist';
import fs from 'fs';
import path from 'path';

const argv = minimist(process.argv.slice(2), { boolean: ['dryRun'], alias: { d: 'dryRun' } });
const FILE_TO_IMPORT = argv.file || argv._[0] || '10.HaftaFikstur.xlsx';
const DRY_RUN = !!argv.dryRun;
const LEAGUE_ID = argv.leagueId ? Number(argv.leagueId) : null;
const SEASON_ID = argv.seasonId ? Number(argv.seasonId) : null;
const EVENT_MODEL_NAME = argv.eventModel || 'MatchEvent'; // optional override

if (!LEAGUE_ID || !SEASON_ID) {
  console.error('Usage: node fiksturImport.mjs --file="/path/to/file.xlsx" --leagueId=14 --seasonId=7 [--dryRun] [--eventModel=MatchEvent]');
  process.exit(1);
}

// file existence check
if (!fs.existsSync(FILE_TO_IMPORT)) {
  console.error(`File not found: ${FILE_TO_IMPORT}`);
  console.error('Give correct path with --file or place the file next to the script.');
  process.exit(2);
}

const prisma = new PrismaClient();

// ---------- pick client keys ----------
const clientKeys = Object.keys(prisma).filter(k => !k.startsWith('_'));
console.log('Prisma client keys:', clientKeys.join(', '));

function pick(keyGuesses) {
  for (const k of keyGuesses) {
    if (prisma[k] && typeof prisma[k].findFirst === 'function') return k;
  }
  return null;
}

// common guesses
const TEAM_KEY = pick(['team','Team','teams','Teams']);
const FIXTURE_KEY = pick(['fixture','Fixture','fixtures','Fixtures']);
const EVENT_KEY = pick([ EVENT_MODEL_NAME[0].toLowerCase()+EVENT_MODEL_NAME.slice(1), EVENT_MODEL_NAME, EVENT_MODEL_NAME.toLowerCase() ]);

if (!TEAM_KEY) {
  console.error('Cannot find Team model in Prisma client. Client keys:', clientKeys.join(', '));
  process.exit(3);
}
if (!FIXTURE_KEY) {
  console.error('Cannot find Fixture model in Prisma client. Client keys:', clientKeys.join(', '));
  process.exit(4);
}
if (!EVENT_KEY) {
  console.error(`Cannot find event model (${EVENT_MODEL_NAME}) in Prisma client. Client keys:`, clientKeys.join(', '));
  process.exit(5);
}

console.log('Using client keys -> team:', TEAM_KEY, 'fixture:', FIXTURE_KEY, 'event:', EVENT_KEY);

// ---------- small parsers ----------
const num = v => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  const cleaned = s.replace(/\s/g,'').replace(/\.(?=\d{3}\b)/g,'').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};
const int = v => {
  const n = num(v);
  return n === null ? null : Math.round(n);
};
const bool = v => {
  if (v === null || v === undefined) return false;
  return String(v).trim() !== '';
};
const dateParse = v => {
  if (!v && v !== 0) return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  const m = s.match(/(\d{1,2})[\.\/\-](\d{1,2})[\.\/\-](\d{4})/);
  if (m) return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`);
  return null;
};

// ---------- minimal find-or-create helpers ----------
async function findOrCreateTeamByName(name) {
  if (!name) return null;
  const clean = String(name).trim();
  // direct exact match
  const found = await prisma[TEAM_KEY].findFirst({ where: { leagueId: Number(LEAGUE_ID), name: clean }, select: { id: true } });
  if (found) return found.id;
  if (DRY_RUN) return `dry-team-${Math.random().toString(36).slice(2,8)}`;
  const created = await prisma[TEAM_KEY].create({ data: { leagueId: Number(LEAGUE_ID), name: clean }, select: { id: true } });
  return created.id;
}

// ---------- main flow ----------
async function main() {
  console.log('Import start. dryRun=', DRY_RUN);
  const workbook = XLSX.readFile(FILE_TO_IMPORT, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: null });
  console.log(`Loaded ${rows.length} rows from sheet: ${sheetName}`);

  const unresolved = [];
  let eventsInserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      const homeName = r['EV'];
      const awayName = r['DEP'];
      const fixtureDate = dateParse(r['Tarih']);

      // find or create teams
      const homeId = await findOrCreateTeamByName(homeName);
      const awayId = await findOrCreateTeamByName(awayName);
      if (!homeId || !awayId) {
        unresolved.push({ row: i+1, homeName, homeId, awayName, awayId });
        continue;
      }

      // find fixture by league/season/home/away/(date if present)
      const where = fixtureDate
        ? { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), homeTeamId: Number(homeId), awayTeamId: Number(awayId), date: fixtureDate }
        : { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), homeTeamId: Number(homeId), awayTeamId: Number(awayId) };

      let fixture = await prisma[FIXTURE_KEY].findFirst({ where, select: { id: true } });

      if (!fixture) {
        const weekNumber = r['Hafta'] ? int(r['Hafta']) : null;
        const matchWeekId = weekNumber ? (await prisma.matchWeek.findFirst({ where: { leagueId: Number(LEAGUE_ID), seasonId: Number(SEASON_ID), weekNumber }, select: { id: true } }))?.id : null;
        const fixtureData = {
          leagueId: Number(LEAGUE_ID),
          seasonId: Number(SEASON_ID),
          weekNumber: weekNumber,
          matchWeekId: matchWeekId || null,
          date: fixtureDate,
          notes: r['Takım/Dakika/Olay Notları'] ?? null,
          homeTeamId: Number(homeId),
          awayTeamId: Number(awayId),
          homeTeamName: homeName ?? null,
          awayTeamName: awayName ?? null,
          homeScore: int(r['EV Skor']),
          awayScore: int(r['DEP Skor']),
          homeXg: num(r['EV xG']),
          awayXg: num(r['DEP xG']),
          homeFormation: r['EV Taktik'] ?? null,
          awayFormation: r['DEP Taktik'] ?? null,
        };
        if (!DRY_RUN) {
          const created = await prisma[FIXTURE_KEY].create({ data: fixtureData, select: { id: true } });
          fixture = created;
        } else {
          fixture = { id: `dry-${i+1}` };
        }
      }

      const fixtureId = fixture.id;

      // event payload minimal fields (adjust names as your schema requires)
      const eventPayload = {
        fixtureId,
        minute: int(r['Dakika']),
        teamName: r['Takım'] ?? null,
        playerFirstName: r['Oyuncu Ad'],
        playerLastName: r['Oyuncu Soyadı'],
        playerPos: r['Oyuncu Pozisyonu'] ?? null,
        playerRating: num(r['Oyuncu Maç Puanı']),
        shotArea: r['Şut Bölgesi'] ?? null,
        shotType: r['Şut Tipi'] ?? null,
        eventLeadUp: r['Pozisyon Gelişimi'] ?? null,
        xG: num(r['xG Oranı']),
        xGOT: num(r['xGOT Oranı']),
        bigChance: bool(r['Büyük Şans']),
        outcome: r['Sonuç'] ?? null,
        scoreAtShot: r['Skor'] ?? null,
        aPlayerFN: r['Asist Yapan Oyuncu Adı']|| null,
        aPlayerLN: r['Asist Yapan Oyuncu Soyadı']|| null,
        notes: r['Takım/Dakika/Olay Notları'] ?? null,
      };

      if (!DRY_RUN) {
        await prisma[EVENT_KEY].create({ data: eventPayload });
      }
      eventsInserted += 1;

    } catch (err) {
      console.error(`Row ${i+1} failed:`, err && err.message ? err.message : err);
    }
  }

  if (unresolved.length) {
    const out = path.join(process.cwd(), 'unresolved_teams.json');
    fs.writeFileSync(out, JSON.stringify(unresolved, null, 2), 'utf-8');
    console.log('Wrote', out, 'entries:', unresolved.length);
  }

  console.log('Done. eventsInserted=', eventsInserted);
  await prisma.$disconnect();
}

main().catch(err => { console.error('Fatal', err); prisma.$disconnect(); process.exit(1); });
