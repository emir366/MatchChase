const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Search/Get Players
router.get('/', asyncHandler(async (req, res) => {
  const { search } = req.query;
  const players = await prisma.player.findMany({
    where: search ? {
      OR: [
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } }
      ]
    } : undefined,
    take: 20,
    include: { nationality: true },
    orderBy: { lastName: 'asc' }
  });
  res.json(players);
}));

// Get Player Profile with Transfer History and Career Stats
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const player = await prisma.player.findUnique({
    where: { id: parseInt(id) },
    include: {
      nationality: true,
      transfers: {
        orderBy: { date: 'desc' },
        include: {
          fromClubSeason: { include: { club: true } },
          toClubSeason: { include: { club: true } }
        }
      },
      squads: {
        include: {
          clubSeason: {
            include: {
              club: true,
              leagueSeason: { include: { season: true, league: true } }
            }
          }
        }
      }
    }
  });

  if (!player) return res.status(404).json({ error: 'Player not found' });

  res.json(player);
}));

module.exports = router;