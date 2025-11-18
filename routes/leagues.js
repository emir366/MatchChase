// backend/routes/leagues.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple request logger for this router
router.use((req, res, next) => {
  console.log(`[Leagues route] ${req.method} ${req.originalUrl}`);
  next();
});

// GET all canonical leagues with their leagueSeasons and counts
router.get('/', async (req, res) => {
  try {
    const { include } = req.query;
    
    let includeClause = {
      nation: true,
    };

    // Handle include queries for related data
    if (include) {
      const includes = include.split(',');
      
      if (includes.includes('leagueSeasons.season')) {
        includeClause.leagueSeasons = {
          include: {
            season: true
          }
        };
      }
      
      if (includes.includes('leagueSeasons._count.clubSeasons')) {
        if (!includeClause.leagueSeasons) {
          includeClause.leagueSeasons = {};
        }
        if (!includeClause.leagueSeasons.include) {
          includeClause.leagueSeasons.include = {};
        }
        includeClause.leagueSeasons.include._count = {
          select: { clubSeasons: true }
        };
      }
    }

    const leagues = await prisma.league.findMany({
      include: includeClause,
      orderBy: { name: 'asc' }
    });
    
    res.json(leagues);
  } catch (error) {
    console.error('GET /leagues error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET specific canonical league by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        nation: true,
        leagueSeasons: {
          include: {
            season: true,
            _count: {
              select: {
                clubSeasons: true,
                fixtures: true
              }
            }
          },
          orderBy: {
            season: {
              name: 'desc'
            }
          }
        }
      }
    });

    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json(league);
  } catch (error) {
    console.error('GET /leagues/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;