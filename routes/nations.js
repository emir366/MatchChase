const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all nations
router.get('/', async (req, res) => {
  try {
    const nations = await prisma.nation.findMany();
    res.json(nations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET nation by ID
router.get('/:id', async (req, res) => {
  try {
    const nation = await prisma.nation.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    res.json(nation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create nation
router.post('/', async (req, res) => {
  try {
    const newNation = await prisma.nation.create({ data: req.body });
    res.json(newNation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update nation by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedNation = await prisma.nation.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json(updatedNation);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Nation not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE nation by ID
router.delete('/:id', async (req, res) => {
  try {
    // First get all leagues and players in this nation to handle foreign key constraints
    const leagues = await prisma.league.findMany({
      where: { nationId: parseInt(req.params.id) },
      select: { id: true }
    });
    
    const players = await prisma.player.findMany({
      where: { nationalityId: parseInt(req.params.id) },
      select: { id: true }
    });
    
    const leagueIds = leagues.map(league => league.id);
    const playerIds = players.map(player => player.id);

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
        where: { nationId: parseInt(req.params.id) }
      });
    }

    if (playerIds.length > 0) {
      await prisma.transfer.deleteMany({
        where: { playerId: { in: playerIds } }
      });

      await prisma.squadMembership.deleteMany({
        where: { playerId: { in: playerIds } }
      });

      await prisma.player.updateMany({
        where: { nationalityId: parseInt(req.params.id) },
        data: { nationalityId: null }
      });
    }

    // Then delete the nation
    const deletedNation = await prisma.nation.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Nation deleted successfully', deletedNation });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Nation not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE all nations
router.delete('/all', async (req, res) => {
  try {
    // Delete in correct order to handle constraints
    await prisma.transfer.deleteMany({});
    await prisma.squadMembership.deleteMany({});
    await prisma.club.deleteMany({});
    await prisma.league.deleteMany({});
    await prisma.player.updateMany({
      where: { nationalityId: { not: null } },
      data: { nationalityId: null }
    });
    
    const result = await prisma.nation.deleteMany({});
    res.json({ message: `Deleted ${result.count} nations` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

