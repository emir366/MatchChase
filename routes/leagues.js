// backend/routes/leagues.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        nation: true,
        leagueSeasons: {
          include: {
            season: true,
            _count: { select: { clubSeasons: true } }
          },
          // order seasons by season.name desc so index 0 is the most-recent by name
          orderBy: { season: { name: 'desc' } }
        }
      },
      orderBy: { name: 'asc' } // optional: alphabetical leagues
    });

    return res.json(leagues);
  } catch (err) {
    console.error('GET /api/leagues error', err);
    return res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

module.exports = router;
