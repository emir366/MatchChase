const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get Fixtures (Filterable by LeagueSeason, Date, or Team)
router.get('/', asyncHandler(async (req, res) => {
  const { leagueSeasonId, date, clubSeasonId, limit } = req.query;
  
  let whereClause = {};
  if (leagueSeasonId) whereClause.leagueSeasonId = parseInt(leagueSeasonId);
  if (date) whereClause.date = new Date(date);
  if (clubSeasonId) {
    const cId = parseInt(clubSeasonId);
    whereClause.OR = [
      { homeClubSeasonId: cId },
      { awayClubSeasonId: cId }
    ];
  }

  const fixtures = await prisma.fixture.findMany({
    where: whereClause,
    take: limit ? parseInt(limit) : 50,
    orderBy: { date: 'asc' },
    include: {
      homeClubSeason: { include: { club: true } },
      awayClubSeason: { include: { club: true } },
      matchWeek: true
    }
  });
  res.json(fixtures);
}));

// Get Single Fixture Details (Lineups, Events, Stats)
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fixture = await prisma.fixture.findUnique({
    where: { id: parseInt(id) },
    include: {
      leagueSeason: { include: { league: true, season: true } },
      homeClubSeason: { include: { club: true } },
      awayClubSeason: { include: { club: true } },
      events: {
        orderBy: { minute: 'asc' }
      },
      matchStats: true,
      gkPerf: true
    }
  });

  if (!fixture) return res.status(404).json({ error: 'Fixture not found' });

  res.json(fixture);
}));

module.exports = router;