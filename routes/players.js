const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all players
router.get("/", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: { nationality: true, squads: true, transfers: true },
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In your backend/routes/players.js
// GET player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        nationality: true,
        squads: {
          include: {
            club: {
              include: {
                league: {
                  include: {
                    nation: true
                  }
                }
              }
            },
            season: true
          }
        },
        transfers: {
          include: {
            fromClub: true,
            toClub: true
          }
        }
      }
    });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(player);
  } catch (err) {
    console.error('Error fetching player:', err);
    res.status(500).json({ error: 'Failed to fetch player: ' + err.message });
  }
});

// POST create player
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      displayName,
      dateOfBirth,
      birthPlace,
      nationalityId,
      age,
      currentMV,
      transferDate,
      prevClub,
      prevMV,
      transferFee,
      status,
      contractExpiry,
      heightCm,
      weightKg,
      position,
      transfermarktId,
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "firstName and lastName are required" });
    }

    const newPlayer = await prisma.player.create({
      data: {
        firstName,
        lastName,
        displayName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        birthPlace,
        nationalityId,
        age,
        currentMV,
        transferDate,
        prevClub,
        prevMV,
        transferFee,
        status,
        contractExpiry,
        heightCm,
        weightKg,
        position,
        transfermarktId,
      },
    });

    res.json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update player by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPlayer = await prisma.player.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json(updatedPlayer);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE player by ID
router.delete('/:id', async (req, res) => {
  try {
    // First delete related records due to foreign key constraints
    await prisma.transfer.deleteMany({
      where: { playerId: parseInt(req.params.id) }
    });

    await prisma.squadMembership.deleteMany({
      where: { playerId: parseInt(req.params.id) }
    });

    // Then delete the player
    const deletedPlayer = await prisma.player.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Player deleted successfully', deletedPlayer });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Player not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE all players (add this endpoint)
router.delete('/all', async (req, res) => {
  try {
    // First delete related records due to foreign key constraints
    await prisma.transfer.deleteMany({});
    await prisma.squadMembership.deleteMany({});
    
    // Then delete all players
    const result = await prisma.player.deleteMany({});
    res.json({ message: `Deleted ${result.count} players` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/club/:clubId", async (req, res) => {
  try {
    const { clubId } = req.params;
    const { season } = req.query;

    const players = await prisma.player.findMany({
      where: {
        squads: {
          some: {
            clubId: parseInt(clubId),
            ...(season && { season: { name: season } })
          }
        }
      },
      include: {
        nationality: true,
        squads: {
          include: {
            club: true,
            season: true
          }
        }
      },
      orderBy: [
        { position: 'asc' },
        { lastName: 'asc' }
      ]
    });

    // Format the response for frontend
    const formattedPlayers = players.map(player => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      displayName: player.displayName,
      age: player.age,
      position: player.position,
      nationality: player.nationality?.name,
      currentMV: player.currentMV,
      shirtNumber: player.squads[0]?.shirtNumber || null,
      club: player.squads[0]?.club?.name,
      season: player.squads[0]?.season?.name
    }));

    res.json(formattedPlayers);
  } catch (error) {
    console.error('Error fetching club players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// YENİ ENDPOINT: Search players by name
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;

    const players = await prisma.player.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        nationality: true,
        squads: {
          include: {
            club: true,
            season: true
          }
        }
      },
      take: 50 // Limit results
    });

    res.json(players);
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// YENİ ENDPOINT: Get players by position
router.get("/position/:position", async (req, res) => {
  try {
    const { position } = req.params;

    const players = await prisma.player.findMany({
      where: {
        position: {
          contains: position,
          mode: 'insensitive'
        }
      },
      include: {
        nationality: true,
        squads: {
          include: {
            club: true,
            season: true
          }
        }
      },
      orderBy: [
        { lastName: 'asc' }
      ]
    });

    res.json(players);
  } catch (error) {
    console.error('Error fetching players by position:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

