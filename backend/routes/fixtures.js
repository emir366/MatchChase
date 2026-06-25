const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get MatchWeeks for a specific League and Season
router.get('/:leagueId/:seasonId/matchweeks', asyncHandler(async (req, res) => {
  const { leagueId, seasonId } = req.params;
  const matchWeeks = await prisma.matchWeek.findMany({
    where: {
      leagueSeason: {
        leagueId: parseInt(leagueId),
        seasonId: parseInt(seasonId)
      }
    },
    orderBy: { weekNumber: 'asc' }
  });
  res.json(matchWeeks);
}));

// Get Fixtures for a specific MatchWeek
router.get('/:leagueId/:seasonId/matchweeks/:matchWeekId/fixtures', asyncHandler(async (req, res) => {
  const { matchWeekId } = req.params;
  const fixtures = await prisma.fixture.findMany({
    where: { matchWeekId: parseInt(matchWeekId) },
    include: {
      homeClubSeason: { include: { club: true } },
      awayClubSeason: { include: { club: true } },
      matchWeek: true
    },
    orderBy: { date: 'asc' }
  });
  res.json(fixtures);
}));

// Get Single Fixture Details with ALL relations
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fixture = await prisma.fixture.findUnique({
    where: { id: parseInt(id) },
    include: {
      leagueSeason: { include: { league: true, season: true } },
      // Include ClubSeasons to get Team IDs
      homeClubSeason: { include: { club: true } },
      awayClubSeason: { include: { club: true } },
      // Include Events sorted by minute
      events: { 
        orderBy: { id: 'asc' } 
      },
      matchStats: true,
      // Include GK Perf (1-to-1 relation)
      gkPerf: true
    }
  });

  if (!fixture) return res.status(404).json({ error: 'Fixture not found' });

  res.json(fixture);
}));

// GENERAL SEARCH
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

module.exports = router;