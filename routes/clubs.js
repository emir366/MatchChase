const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// We use 'take: 1' inside clubSeasons to efficiently get only the latest season for the link
router.get('/', asyncHandler(async (req, res) => {
  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' },
    include: {
      nation: true,
      clubSeasons: {
        orderBy: { leagueSeason: { season: { name: 'desc' } } }, // Sort by season name (e.g. "23/24")
        take: 1, // Only fetch the most recent one
        include: {
          leagueSeason: {
            include: { season: true }
          }
        }
      }
    }
  });
  res.json(clubs);
}));

// Get a Club's detailed profile
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const club = await prisma.club.findUnique({
    where: { id: parseInt(id) },
    include: {
      nation: true,
      clubSeasons: {
        orderBy: { leagueSeason: { season: { name: 'desc' } } }, 
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

// Used for the Club Dashboard to show the season selector
router.get('/season/:id', asyncHandler(async (req, res) => {
  const { id } = req.params; // This is the clubSeasonId

  const clubSeason = await prisma.clubSeason.findUnique({
    where: { id: parseInt(id) },
    include: {
      // 1. Context for this specific season
      leagueSeason: {
        include: { season: true, league: true }
      },
      // 2. Parent Club info + Sibling Seasons (for the selector)
      club: {
        include: {
          nation: true,
          clubSeasons: {
            include: {
              leagueSeason: { include: { season: true } }
            },
            orderBy: { leagueSeason: { season: { name: 'desc' } } }
          }
        }
      }
    }
  });

  if (!clubSeason) {
    return res.status(404).json({ error: 'Club Season context not found' });
  }

  res.json(clubSeason);
}));

// Get a Club's Squad for a specific Season context (ClubSeason)
router.get('/season/:id/squad', asyncHandler(async (req, res) => {
  const { id } = req.params; 
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