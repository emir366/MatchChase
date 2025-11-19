const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get a Club's detailed profile
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const club = await prisma.club.findUnique({
    where: { id: parseInt(id) },
    include: {
      nation: true,
      clubSeasons: {
        orderBy: { leagueSeason: { season: { name: 'desc' } } }, // Most recent seasons first
        take: 5,
        include: {
          leagueSeason: {
            include: { season: true, league: true }
          }
        }
      }
    }
  });

  if (!club) return res.status(404).json({ error: 'Club not found' });

  res.json(club);
}));

// Get a Club's Squad for a specific Season context (ClubSeason)
router.get('/season/:id/squad', asyncHandler(async (req, res) => {
  const { id } = req.params; // This is the clubSeasonId
  const squad = await prisma.squadMembership.findMany({
    where: { clubSeasonId: parseInt(id) },
    include: {
      player: {
        include: { nationality: true }
      }
    }
  });
  res.json(squad);
}));

module.exports = router;