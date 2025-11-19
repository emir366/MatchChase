const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get all leagues (optional filter ?nationId=1)
router.get('/', asyncHandler(async (req, res) => {
  const { nationId } = req.query;
  
  const leagues = await prisma.league.findMany({
    where: nationId ? { nationId: parseInt(nationId) } : undefined,
    include: { 
      nation: true,
      leagueSeasons: {
        include: {
          season: true // Vital for frontend to identify the "latest" season
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  res.json(leagues);
}));

// Get a specific LeagueSeason context (Detailed View)
router.get('/season/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const leagueSeason = await prisma.leagueSeason.findUnique({
    where: { id: parseInt(id) },
    include: {
      // VITAL: Include League -> LeagueSeasons -> Season for the selector
      league: {
        include: {
          nation: true,
          leagueSeasons: {
            include: { season: true }
          }
        }
      },
      season: true,
      // Include Clubs in this season
      clubSeasons: {
        include: {
          club: {
            include: { nation: true }
          }
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