const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET goalkeeper performance by fixture ID
router.get('/:fixtureId/gkperf', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    console.log(`Fetching GK performance for fixture: ${fixtureId}`);

    const gkPerf = await prisma.gkPerf.findUnique({
      where: {
        fixtureId: parseInt(fixtureId),
      },
    });

    if (!gkPerf) {
      console.log(`No GK performance found for fixture: ${fixtureId}`);
      return res.status(404).json({ error: 'Goalkeeper performance data not found for this fixture' });
    }

    console.log(`Found GK performance for fixture: ${fixtureId}`);
    res.json(gkPerf);
  } catch (error) {
    console.error('Error fetching goalkeeper performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all goalkeeper performances
router.get('/', async (req, res) => {
  try {
    const gkPerfs = await prisma.gkPerf.findMany({
      include: {
        fixture: {
          select: {
            homeTeamName: true,
            awayTeamName: true,
            date: true,
          },
        },
      },
      orderBy: {
        fixtureId: 'desc',
      },
    });

    res.json(gkPerfs);
  } catch (error) {
    console.error('Error fetching goalkeeper performances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new goalkeeper performance
router.post('/', async (req, res) => {
  try {
    const {
      fixtureId,
      homeGkFn,
      homeGkLn,
      awayGkFn,
      awayGkLn,
      homeGkRating,
      awayGkRating,
      homeGkSaves,
      awayGkSaves,
    } = req.body;

    // Check if fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id: parseInt(fixtureId) },
    });

    if (!fixture) {
      return res.status(404).json({ error: 'Fixture not found' });
    }

    const newGkPerf = await prisma.gkPerf.create({
      data: {
        fixtureId: parseInt(fixtureId),
        homeGkFn,
        homeGkLn,
        awayGkFn,
        awayGkLn,
        homeGkRating: homeGkRating ? parseInt(homeGkRating) : null,
        awayGkRating: awayGkRating ? parseInt(awayGkRating) : null,
        homeGkSaves: homeGkSaves ? parseInt(homeGkSaves) : null,
        awayGkSaves: awayGkSaves ? parseInt(awayGkSaves) : null,
      },
    });

    res.status(201).json(newGkPerf);
  } catch (error) {
    console.error('Error creating goalkeeper performance:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Goalkeeper performance data already exists for this fixture' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;