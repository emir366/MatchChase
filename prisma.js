// prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  // optional: log: ['query', 'info', 'warn', 'error']
});

module.exports = prisma;

