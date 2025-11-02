// backend/routes/leagues.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple request logger for this router
router.use((req, res, next) => {
  console.log(`[Leagues route] ${req.method} ${req.originalUrl}`);
  next();
});

// GET all leagues (basic)
router.get('/', async (req, res) => {
  try {
    const leagues = await prisma.league.findMany({
      include: { 
        nation: true, 
        season: true, 
        clubs: {
          include: {
            squads: {
              include: {
                player: true
              }
            }
          }
        }
      },
      orderBy: [{ name: 'asc' }, { seasonId: 'desc' }]
    });
    res.json(leagues);
  } catch (error) {
    console.error('GET /leagues error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET leagues by name (across all seasons)
router.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const leagues = await prisma.league.findMany({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      },
      include: { 
        nation: true, 
        season: true,
        clubs: {
          include: {
            squads: {
              include: {
                player: true,
                season: true
              }
            }
          }
        }
      },
      orderBy: { seasonId: 'desc' }
    });

    if (leagues.length === 0) {
      return res.status(404).json({ error: 'No leagues found with that name' });
    }

    res.json(leasons);
  } catch (error) {
    console.error('GET /leagues/name/:name error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET league groups (all leagues grouped by name)
router.get('/groups/all', async (req, res) => {
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
    console.error('GET /leagues/groups/all error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /leagues/:id/clubs?seasonId=NN
 */
router.get('/:id/clubs', async (req, res) => {
  const { id } = req.params;
  const seasonId = req.query.seasonId ? parseInt(req.query.seasonId) : undefined;

  try {
    const baseLeague = await prisma.league.findUnique({
      where: { id: parseInt(id) },
      include: { season: true },
    });

    if (!baseLeague) {
      return res.status(404).json({ error: 'League not found' });
    }

    let targetLeagueId = parseInt(id);

    if (seasonId) {
      const leagueForSeason = await prisma.league.findFirst({
        where: {
          name: baseLeague.name,
          seasonId: seasonId,
        },
        include: { season: true }
      });

      if (!leagueForSeason) {
        return res.status(404).json({
          error: 'No league record found for that season and league name',
          leagueName: baseLeague.name,
          seasonId,
        });
      }
      targetLeagueId = leagueForSeason.id;
    }

    const clubs = await prisma.club.findMany({
      where: { leagueId: targetLeagueId },
      include: {
        league: { 
          include: { 
            season: true,
            nation: true 
          } 
        },
        squads: {
          include: {
            player: true,
            season: true
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    res.json(clubs);
  } catch (err) {
    console.error(`GET /leagues/${id}/clubs error:`, err);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

/**
 * GET league by ID - returns league plus an array of seasons in which this league name exists.
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const league = await prisma.league.findUnique({
      where: { id },
      include: { 
        nation: true, 
        season: true,
        clubs: {
          include: {
            squads: {
              include: {
                player: true,
                season: true
              }
            }
          }
        }
      },
    });

    if (!league) return res.status(404).json({ error: 'League not found' });

    // Find all league records with same name (so we can present seasons)
    const leaguesWithSameName = await prisma.league.findMany({
      where: { 
        name: {
          equals: league.name,
          mode: 'insensitive'
        }
      },
      include: { season: true },
      orderBy: { seasonId: 'desc' },
    });

    // Extract unique seasons
    const seasons = [];
    const seen = new Set();
    for (const l of leaguesWithSameName) {
      if (l.season && !seen.has(l.season.id)) {
        seasons.push({ id: l.season.id, name: l.season.name });
        seen.add(l.season.id);
      }
    }

    res.json({ 
      league, 
      seasons,
      allLeagues: leaguesWithSameName.map(l => ({
        id: l.id,
        seasonId: l.seasonId,
        seasonName: l.season.name
      }))
    });
  } catch (err) {
    console.error('GET /leagues/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create league (single season)
router.post("/", async (req, res) => {
  try {
    const { name, nationId, seasonId } = req.body;

    if (!name || !nationId || !seasonId) {
      return res.status(400).json({ error: "name, nationId, and seasonId are required" });
    }

    const newLeague = await prisma.league.create({
      data: {
        name,
        nationId,
        seasonId,
      },
      include: {
        nation: true,
        season: true
      }
    });
    res.status(201).json(newLeague);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ 
        error: "A league with this name already exists for the selected season and nation" 
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// POST create league for ALL existing seasons
router.post("/bulk-all-seasons", async (req, res) => {
  try {
    const { name, nationId } = req.body;

    if (!name || !nationId) {
      return res.status(400).json({ error: "name and nationId are required" });
    }

    // Get all existing seasons
    const allSeasons = await prisma.season.findMany({
      select: { id: true, name: true }
    });

    if (allSeasons.length === 0) {
      return res.status(400).json({ error: "No seasons exist in the database" });
    }

    // Create league for each season
    const createdLeagues = [];
    const errors = [];

    for (const season of allSeasons) {
      try {
        const newLeague = await prisma.league.create({
          data: {
            name,
            nationId,
            seasonId: season.id,
          },
          include: {
            nation: true,
            season: true
          }
        });
        createdLeagues.push(newLeague);
      } catch (error) {
        if (error.code === 'P2002') {
          errors.push(`League already exists for season: ${season.name}`);
        } else {
          errors.push(`Error creating for season ${season.name}: ${error.message}`);
        }
      }
    }

    res.status(201).json({
      message: `Created ${createdLeagues.length} league(s) across ${allSeasons.length} season(s)`,
      created: createdLeagues,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update league by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, nationId, seasonId } = req.body;
    const leagueId = parseInt(req.params.id);

    const updatedLeague = await prisma.league.update({
      where: { id: leagueId },
      data: req.body,
      include: {
        nation: true,
        season: true,
        clubs: true
      }
    });
    
    res.json(updatedLeague);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'League not found' });
    } else if (err.code === 'P2002') {
      res.status(400).json({ 
        error: "Another league with this name already exists for the selected season and nation" 
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE league by ID (single league instance)
router.delete('/:id', async (req, res) => {
  try {
    // First get all clubs in this league to handle foreign key constraints
    const clubs = await prisma.club.findMany({
      where: { leagueId: parseInt(req.params.id) },
      select: { id: true }
    });
    
    const clubIds = clubs.map(club => club.id);

    // Delete related records due to foreign key constraints
    if (clubIds.length > 0) {
      await prisma.transfer.deleteMany({
        where: {
          OR: [
            { fromClubId: { in: clubIds } },
            { toClubId: { in: clubIds } }
          ]
        }
      });
      
      await prisma.squadMembership.deleteMany({
        where: { clubId: { in: clubIds } }
      });

      await prisma.club.deleteMany({
        where: { leagueId: parseInt(req.params.id) }
      });
    }

    // Then delete the league
    const deletedLeague = await prisma.league.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'League deleted successfully', deletedLeague });
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'League not found' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE all leagues with a specific name (across all seasons)
router.delete('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // First find all leagues with this name
    const leagues = await prisma.league.findMany({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      },
      include: {
        clubs: {
          select: { id: true }
        }
      }
    });

    if (leagues.length === 0) {
      return res.status(404).json({ error: 'No leagues found with that name' });
    }

    // Get all club IDs from these leagues
    const clubIds = leagues.flatMap(league => 
      league.clubs.map(club => club.id)
    );

    // Delete related records
    if (clubIds.length > 0) {
      await prisma.transfer.deleteMany({
        where: {
          OR: [
            { fromClubId: { in: clubIds } },
            { toClubId: { in: clubIds } }
          ]
        }
      });
      
      await prisma.squadMembership.deleteMany({
        where: { clubId: { in: clubIds } }
      });

      await prisma.club.deleteMany({
        where: { id: { in: clubIds } }
      });
    }

    // Delete the leagues
    const result = await prisma.league.deleteMany({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    res.json({ 
      message: `Deleted ${result.count} league(s) with name "${name}" across all seasons`,
      deletedLeagues: result.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE all leagues
router.delete('/all', async (req, res) => {
  try {
    // Delete in correct order to handle constraints
    await prisma.transfer.deleteMany({});
    await prisma.squadMembership.deleteMany({});
    await prisma.club.deleteMany({});
    
    const result = await prisma.league.deleteMany({});
    res.json({ message: `Deleted ${result.count} leagues` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;