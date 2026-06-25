const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Global Search (Clubs and Players)
router.get('/', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  // Basic validation
  if (!q || q.length < 3) {
    return res.json({ clubs: [], players: [] });
  }

  const [clubs, players] = await Promise.all([
    prisma.club.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 5,
      include: { nation: true }
    }),
    prisma.player.findMany({
      where: { 
         OR: [
           { lastName: { contains: q, mode: 'insensitive' } },
           { displayName: { contains: q, mode: 'insensitive' } }
         ]
      },
      take: 5,
      include: { nationality: true }
    })
  ]);
  res.json({ clubs, players });
}));

module.exports = router;