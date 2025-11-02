const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all seasons
router.get('/', async (req, res) => {
  try {
    const seasons = await prisma.season.findMany({
      include: { leagues: true }
    });
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET season by ID
router.get('/:id', async (req, res) => {
  try {
    const season = await prisma.season.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { leagues: true }
    });
    res.json(season);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create season
router.post('/', async (req, res) => {
  try {
    const newSeason = await prisma.season.create({ data: req.body });
    res.json(newSeason);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update season by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedSeason = await prisma.season.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json(updatedSeason);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Season not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE season by ID
router.delete('/:id', async (req, res) => {
  try {
    // First get all leagues and squad memberships in this season to handle foreign key constraints
    const leagues = await prisma.league.findMany({
      where: { seasonId: parseInt(req.params.id) },
      select: { id: true }
    });
    
    const leagueIds = leagues.map(league => league.id);

    // Delete related records due to foreign key constraints
    if (leagueIds.length > 0) {
      // Get clubs in these leagues
      const clubs = await prisma.club.findMany({
        where: { leagueId: { in: leagueIds } },
        select: { id: true }
      });
      
      const clubIds = clubs.map(club => club.id);

      if (clubIds.length > 0) {
        await prisma.transfer.deleteMany({
          where: {
            OR: [
              { fromClubId: { in: clubIds } },
              { toClubId: { in: clubIds } }
            ]
          }
        });

        await prisma.squadMembership.deleteMany({
          where: { clubId: { in: clubIds } }
        });

        await prisma.club.deleteMany({
          where: { leagueId: { in: leagueIds } }
        });
      }

      await prisma.league.deleteMany({
        where: { seasonId: parseInt(req.params.id) }
      });
    }

    // Delete squad memberships directly associated with this season
    await prisma.squadMembership.deleteMany({
      where: { seasonId: parseInt(req.params.id) }
    });

    // Then delete the season
    const deletedSeason = await prisma.season.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Season deleted successfully', deletedSeason });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Season not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE all seasons
router.delete('/all', async (req, res) => {
  try {
    // Delete in correct order to handle constraints
    await prisma.transfer.deleteMany({});
    await prisma.squadMembership.deleteMany({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    
    const result = await prisma.season.deleteMany({});
    res.json({ message: `Deleted ${result.count} seasons` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

