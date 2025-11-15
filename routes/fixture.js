// backend/routes/fixture.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/fixture/:fixtureId
router.get('/:fixtureId', async (req, res) => {
  const { fixtureId } = req.params;
  try {
    const fixture = await prisma.fixture.findUnique({
      where: { id: Number(fixtureId) },
      select: {
        id: true,
        leagueId: true,
        seasonId: true,
        matchWeekId: true,
        weekNumber: true,
        date: true,
        notes: true,
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
    if (!fixture) return res.status(404).json({ error: 'Fixture not found' });
    return res.json(fixture);
  } catch (err) {
    console.error('GET fixture error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fixture/:fixtureId/events
router.get('/:fixtureId/events', async (req, res) => {
  const { fixtureId } = req.params;
  try {
    const events = await prisma.matchEvent.findMany({
      where: { fixtureId: Number(fixtureId) },
      orderBy: [{ minute: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        minute: true,
        minuteStr: true,
        teamName: true,
        playerFirstName: true,
        playerLastName: true,
        playerPos: true,
        playerRating: true,
        shotArea: true,
        shotType: true,
        eventLeadUp: true,
        xG: true,
        xGOT: true,
        bigChance: true,
        outcome: true,
        score: true,
        aPlayerFN: true,
        aPlayerLN: true,
      }
    });
    return res.json(events);
  } catch (err) {
    console.error('GET fixture events error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/fixture/:fixtureId/gkperf
router.get('/:fixtureId/gkperf', async (req, res) => {
  const { fixtureId } = req.params;
  try {
    const gkPerf = await prisma.matchEvent.findMany({
      where: { fixtureId: Number(fixtureId) },
      select: {
        id: true,
        homeGkFn: true,
        homeGkLn: true,
        awayGkFn: true,
        awayGkLn: true,
        homeGkRating: true,
        awayGkRating: true,
        homeGkSaves: true,
        awayGkSaves: true,
      }
    });
    return res.json(gkPerf);
  } catch (err) {
    console.error('GET fixture gkperf error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
