const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { asyncHandler } = require('../utils');

// Get all seasons available in the DB
router.get('/', asyncHandler(async (req, res) => {
  const seasons = await prisma.season.findMany({
    orderBy: { name: 'desc' }
  });
  res.json(seasons);
}));

module.exports = router;