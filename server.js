const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const nationsRouter = require('./routes/nations');
const leagueRouter = require('./routes/league');
const clubsRouter = require('./routes/clubs');
const playersRouter = require('./routes/players');
const seasonsRouter = require('./routes/seasons');
const transfersRouter = require('./routes/transfers');
const fixturesRouter = require('./routes/fixtures');
const fixtureRouter = require('./routes/fixture');
const leagueSeasonsRouter = require('./routes/leagueseasons')
//const clubSeasonsRouter = require('./routes/clubseasons');

const app = express();
// replace app.use(cors());
app.use(cors({ origin: true, credentials: true }));
/*
const allowedOrigins = [
  'http://localhost:3000',            // local dev
  'http://127.0.0.1:3000',
  'https://indigo-chicken-577243.hostingersite.com/'  // <- replace with your Hostinger domain
];*/
/*
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
*/
app.use(bodyParser.json());

// Mount routes
app.use('/nations', nationsRouter);
app.use('/api/league', leagueRouter);  
app.use('/clubs', clubsRouter);
app.use('/players', playersRouter);
app.use('/seasons', seasonsRouter);
app.use('/transfers', transfersRouter);
app.use('/api/fixtures', fixturesRouter);
app.use('/api/fixture', fixtureRouter);
app.use('/leagueseasons', leagueSeasonsRouter);
//app.use('/clubseasons', clubSeasonsRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
