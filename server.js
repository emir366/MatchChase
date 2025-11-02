const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const nationsRouter = require('./routes/nations');
const leaguesRouter = require('./routes/leagues');
const clubsRouter = require('./routes/clubs');
const playersRouter = require('./routes/players');
const seasonsRouter = require('./routes/seasons');
const transfersRouter = require('./routes/transfers');
const fixturesRouter = require('./routes/fixtures');
const fixtureRouter = require('./routes/fixture');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use('/nations', nationsRouter);
app.use('/leagues', leaguesRouter);  // This should handle /leagues/groups/all
app.use('/clubs', clubsRouter);
app.use('/players', playersRouter);
app.use('/seasons', seasonsRouter);
app.use('/transfers', transfersRouter);
app.use('/api/fixtures', fixturesRouter);
app.use('/api/fixture', fixtureRouter);

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Add a test route to verify the leagues groups endpoint
app.get('/test-leagues-groups', async (req, res) => {
  // You can temporarily add the logic here to test
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const allLeagues = await prisma.league.findMany({
      include: {
        nation: true,
        season: true,
        clubs: true
      },
      orderBy: [{ name: 'asc' }, { seasonId: 'desc' }]
    });

    // Group by league name
    const leagueGroups = {};
    allLeagues.forEach(league => {
      if (!leagueGroups[league.name]) {
        leagueGroups[league.name] = {
          name: league.name,
          nation: league.nation,
          seasons: []
        };
      }
      leagueGroups[league.name].seasons.push({
        id: league.id,
        season: league.season,
        clubs: league.clubs
      });
    });

    res.json(Object.values(leagueGroups));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// at top of server.js (near other requires)
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// later, when starting server:
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
