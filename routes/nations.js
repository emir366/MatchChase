const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get all nations
router.get('/', asyncHandler(async (req, res) => {
  const nations = await prisma.nation.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(nations);
}));

// Get specific nation with its leagues and clubs
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nation = await prisma.nation.findUnique({
    where: { id: parseInt(id) },
    include: {
      Leagues: true,
      Clubs: { 
        take: 20, 
        orderBy: { name: 'asc' }
      } 
    }
  });
  
  if (!nation) {
    return res.status(404).json({ error: 'Nation not found' });
  }
  
  res.json(nation);
}));

module.exports = router;