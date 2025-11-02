// backend/routes/fixtures.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/fixtures/leagues
// Return leagues and seasons that have fixtures (grouped)
router.get('/leagues', async (req, res) => {
  try {
    // fetch fixtures with league and season join
    const rows = await prisma.fixture.findMany({
      select: {
        leagueId: true,
        seasonId: true,
        league: { select: { id: true, name: true } },
        season: { select: { id: true, name: true } },
      },
      distinct: ['leagueId', 'seasonId'],
      orderBy: [{ leagueId: 'asc' }, { seasonId: 'asc' }],
    });

    // group seasons under league
    const byLeague = {};
    rows.forEach(r => {
      const lid = r.leagueId;
      if (!byLeague[lid]) {
        byLeague[lid] = { id: r.league.id, name: r.league.name, seasons: [] };
      }
      // avoid duplicate seasons
      if (!byLeague[lid].seasons.find(s => s.id === r.season.id)) {
        byLeague[lid].seasons.push({ id: r.season.id, name: r.season.name });
      }
    });

    return res.json(Object.values(byLeague));
  } catch (err) {
    console.error('GET /api/fixtures/leagues error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fixtures/:leagueId/:seasonId/matchweeks
router.get('/:leagueId/:seasonId/matchweeks', async (req, res) => {
  const { leagueId, seasonId } = req.params;
  try {
    const weeks = await prisma.matchWeek.findMany({
      where: { leagueId: Number(leagueId), seasonId: Number(seasonId) },
      orderBy: { weekNumber: 'asc' },
      select: { id: true, weekNumber: true }
    });
    return res.json(weeks);
  } catch (err) {
    console.error('GET matchweeks error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fixtures/:leagueId/:seasonId/matchweeks/:matchWeekId/fixtures
router.get('/:leagueId/:seasonId/matchweeks/:matchWeekId/fixtures', async (req, res) => {
  const { leagueId, seasonId, matchWeekId } = req.params;
  try {
    const fixtures = await prisma.fixture.findMany({
      where: {
        leagueId: Number(leagueId),
        seasonId: Number(seasonId),
        matchWeekId: Number(matchWeekId)
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        weekNumber: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeamName: true,
        awayTeamName: true,
        homeScore: true,
        awayScore: true,
        homeXg: true,
        awayXg: true,
        homeFormation: true,
        awayFormation: true
      }
    });
    return res.json(fixtures);
  } catch (err) {
    console.error('GET fixtures for matchweek error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
