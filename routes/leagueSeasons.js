// backend/routes/leagueseasons.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple request logger for this router
router.use((req, res, next) => {
  console.log(`[LeagueSeasons route] ${req.method} ${req.originalUrl}`);
  next();
});

// GET all league seasons
router.get('/', async (req, res) => {
  try {
    const { include } = req.query;
    
    let includeClause = {
      league: {
        include: {
          nation: true
        }
      },
      season: true
    };

    // Handle include queries
    if (include) {
      const includes = include.split(',');
      
      if (includes.includes('clubSeasons')) {
        includeClause.clubSeasons = {
          include: {
            club: true
          }
        };
      }
      
      if (includes.includes('_count.clubSeasons')) {
        includeClause._count = {
          select: { clubSeasons: true }
        };
      }
    }

    const leagueSeasons = await prisma.leagueSeason.findMany({
      include: includeClause,
      orderBy: [
        { league: { name: 'asc' } },
        { season: { name: 'desc' } }
      ]
    });
    
    res.json(leagueSeasons);
  } catch (error) {
    console.error('GET /leagueseasons error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET specific league season by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const leagueSeason = await prisma.leagueSeason.findUnique({
      where: { id },
      include: {
        league: {
          include: {
            nation: true
          }
        },
        season: true,
        clubSeasons: {
          include: {
            club: {
              include: {
                nation: true
              }
            },
            squads: {
              include: {
                player: true
              }
            }
          },
          orderBy: {
            club: {
              name: 'asc'
            }
          }
        },
        matchWeeks: {
          orderBy: {
            weekNumber: 'asc'
          }
        },
        fixtures: {
          include: {
            homeTeam: {
              include: {
                club: true
              }
            },
            awayTeam: {
              include: {
                club: true
              }
            },
            matchWeek: true
          },
          orderBy: [
            { matchWeek: { weekNumber: 'asc' } },
            { date: 'asc' }
          ]
        }
      }
    });

    if (!leagueSeason) {
      return res.status(404).json({ error: 'League season not found' });
    }

    res.json(leagueSeason);
  } catch (error) {
    console.error('GET /leagueseasons/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;