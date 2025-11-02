const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all clubs
router.get("/", async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: { league: true }, // 👈 include league info
    });
    res.json(clubs);
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({ error: error.message });
  }
});


// GET club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { league: true }
    });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET squad of a club - IMPROVED VERSION
router.get('/:id/squad', async (req, res) => {
  try {
    const { season } = req.query; 
    
    const squad = await prisma.squadMembership.findMany({
      where: { 
        clubId: parseInt(req.params.id),
        ...(season && { season: { name: season } }) 
      },
      include: { 
        player: {
          include: {
            nationality: true 
          }
        },
        season: true 
      },
      orderBy: [
        { player: { position: 'asc' } }, 
        { player: { lastName: 'asc' } }
      ]
    });

    // Frontend için formatlı response
    const formattedSquad = squad.map(membership => ({
      id: membership.player.id,
      firstName: membership.player.firstName,
      lastName: membership.player.lastName,
      displayName: membership.player.displayName,
      age: membership.player.age,
      position: membership.player.position,
      nationality: membership.player.nationality?.name,
      currentMV: membership.player.currentMV,
      shirtNumber: membership.shirtNumber,
      club: membership.clubId,
      season: membership.season?.name
    }));

    res.json(formattedSquad);
  } catch (err) {
    console.error('Error fetching squad:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create club
router.post("/", async (req, res) => {
  try {
    const { name, leagueId } = req.body;

    if (!leagueId) {
      return res.status(400).json({ error: "leagueId is required" });
    }

    const newClub = await prisma.club.create({
      data: {
        name,
        league: {
          connect: { id: leagueId }, // link to existing league
        },
      },
    });

    res.json(newClub);
  } catch (error) {
    console.error("Error creating club:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update club by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedClub = await prisma.club.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json(updatedClub);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Club not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // First delete related records due to foreign key constraints
    await prisma.transfer.deleteMany({
      where: {
        OR: [
          { fromClubId: parseInt(req.params.id) },
          { toClubId: parseInt(req.params.id) }
        ]
      }
    });

    await prisma.squadMembership.deleteMany({
      where: { clubId: parseInt(req.params.id) }
    });

    // Then delete the club
    const deletedClub = await prisma.club.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Club deleted successfully', deletedClub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE all clubs
router.delete('/all', async (req, res) => {
  try {
    // Delete in correct order to handle constraints
    await prisma.transfer.deleteMany({});
    await prisma.squadMembership.deleteMany({});
    
    const result = await prisma.club.deleteMany({});
    res.json({ message: `Deleted ${result.count} clubs` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

