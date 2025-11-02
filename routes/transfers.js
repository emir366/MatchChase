const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: { player: true, fromClub: true, toClub: true }
    });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transfer by ID
router.get('/:id', async (req, res) => {
  try {
    const transfer = await prisma.transfer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { player: true, fromClub: true, toClub: true }
    });
    res.json(transfer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create transfer
router.post('/', async (req, res) => {
  try {
    const newTransfer = await prisma.transfer.create({ data: req.body });
    res.json(newTransfer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

