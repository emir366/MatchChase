const express = require('express');
const cors = require('cors');
const { mapPrismaError } = require('./utils');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = express();

const nationsRouter = require('./routes/nations');
const leaguesRouter = require('./routes/leagues');
const clubsRouter = require('./routes/clubs');
const playersRouter = require('./routes/players');
const seasonsRouter = require('./routes/seasons');
const fixturesRouter = require('./routes/fixtures');
const searchRouter = require('./routes/search')


app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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

// Mount routes
app.use('/api/nations', nationsRouter);
app.use('/api/leagues', leaguesRouter);  
app.use('/api/clubs', clubsRouter);
app.use('/api/players', playersRouter);
app.use('/api/seasons', seasonsRouter);
app.use('/api/fixtures', fixturesRouter);
app.use('/api/search', searchRouter)


// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // 1. Check if it's a Prisma Error
  const prismaError = mapPrismaError(err);
  if (prismaError) {
    return res.status(prismaError.status).json(prismaError.body);
  }

  // 2. Handle generic errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
