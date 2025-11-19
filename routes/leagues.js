const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get all leagues (optional filter ?nationId=1)
router.get('/', asyncHandler(async (req, res) => {
  const { nationId } = req.query;
  const leagues = await prisma.league.findMany({
    where: nationId ? { nationId: parseInt(nationId) } : undefined,
    include: { nation: true },
    orderBy: { name: 'asc' }
  });
  res.json(leagues);
}));

// Get a specific LeagueSeason (e.g., Premier League 23/24 context)
router.get('/season/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const leagueSeason = await prisma.leagueSeason.findUnique({
    where: { id: parseInt(id) },
    include: {
      league: true,
      season: true,
      clubSeasons: {
        include: {
          club: true
        }
      }
    }
  });

  if (!leagueSeason) {
    return res.status(404).json({ error: 'League Season context not found' });
  }

  res.json(leagueSeason);
}));

module.exports = router;