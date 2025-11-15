const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET goalkeeper performance by fixture ID
router.get('/:fixtureId/gkperf', async (req, res) => {
  try {
    const { fixtureId } = req.params;

    const gkPerf = await prisma.gkPerf.findUnique({
      where: {
        fixtureId: parseInt(fixtureId),
      },
    });

    if (!gkPerf) {
      return res.status(404).json({ error: 'Goalkeeper performance data not found for this fixture' });
    }

    res.json(gkPerf);
  } catch (error) {
    console.error('Error fetching goalkeeper performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all goalkeeper performances (optional - for admin purposes)
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

    // Check if goalkeeper performance already exists for this fixture
    const existingGkPerf = await prisma.gkPerf.findUnique({
      where: { fixtureId: parseInt(fixtureId) },
    });

    if (existingGkPerf) {
      return res.status(400).json({ error: 'Goalkeeper performance data already exists for this fixture' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE goalkeeper performance
router.put('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const {
      homeGkFn,
      homeGkLn,
      awayGkFn,
      awayGkLn,
      homeGkRating,
      awayGkRating,
      homeGkSaves,
      awayGkSaves,
    } = req.body;

    const updatedGkPerf = await prisma.gkPerf.update({
      where: {
        fixtureId: parseInt(fixtureId),
      },
      data: {
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

    res.json(updatedGkPerf);
  } catch (error) {
    console.error('Error updating goalkeeper performance:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Goalkeeper performance data not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE goalkeeper performance
router.delete('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;

    await prisma.gkPerf.delete({
      where: {
        fixtureId: parseInt(fixtureId),
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goalkeeper performance:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Goalkeeper performance data not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;