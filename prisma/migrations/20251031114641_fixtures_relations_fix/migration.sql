-- CreateTable
CREATE TABLE "public"."MatchWeek" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,

    CONSTRAINT "MatchWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Fixture" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "matchWeekId" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "homeTeamName" TEXT,
    "awayTeamName" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "homeXg" DOUBLE PRECISION,
    "awayXg" DOUBLE PRECISION,
    "homeFormation" TEXT,
    "awayFormation" TEXT,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FixtureMatchStats" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "notes" TEXT,
    "homePossession" DOUBLE PRECISION,
    "awayPossession" DOUBLE PRECISION,
    "homeXG" DOUBLE PRECISION,
    "awayXG" DOUBLE PRECISION,
    "homBbigChance" INTEGER,
    "awayBigChance" INTEGER,
    "homeShots" INTEGER,
    "awayShots" INTEGER,
    "homeSaves" INTEGER,
    "awaySaves" INTEGER,
    "homeCriticalSaves" INTEGER,
    "awayCriticalSaves" INTEGER,
    "homeGKPerf" DOUBLE PRECISION,
    "awayGKPerf" DOUBLE PRECISION,
    "homeCorners" INTEGER,
    "awayCorners" INTEGER,
    "homeFouls" INTEGER,
    "awayFouls" INTEGER,
    "homePasses" INTEGER,
    "awayPasses" INTEGER,
    "homeInterceptions" INTEGER,
    "awayInterceptions" INTEGER,
    "homeFKs" INTEGER,
    "awayFKs" INTEGER,
    "homeYellowCards" INTEGER,
    "awayYellowCards" INTEGER,
    "homeRedCards" INTEGER,
    "awayRedCards" INTEGER,
    "homePenaltyXG" INTEGER,
    "awayPenaltyXG" INTEGER,
    "homeshotsOnTarget" INTEGER,
    "awayshotsOnTarget" INTEGER,
    "homeShotPct" INTEGER,
    "awayShotPct" INTEGER,
    "homePosts" INTEGER,
    "awayPosts" INTEGER,
    "homeShotOffTarget" INTEGER,
    "awayShotOffTarget" INTEGER,
    "homeBlockedShots" INTEGER,
    "awayBlockedShots" INTEGER,
    "homeShotsInBox" INTEGER,
    "awayShotsInBox" INTEGER,
    "homeShotsInBoxPct" INTEGER,
    "awayShotsInBoxPct" INTEGER,
    "homeShotsOutBox" INTEGER,
    "awayShotsOutBox" INTEGER,
    "homeShotsOutBoxPct" INTEGER,
    "awayShotsOutBoxPct" INTEGER,
    "homeErrorToShot" DOUBLE PRECISION,
    "awayErrorToShot" DOUBLE PRECISION,
    "homeErrorToGoal" DOUBLE PRECISION,
    "awayErrorToGoal" DOUBLE PRECISION,

    CONSTRAINT "FixtureMatchStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchEvent" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "minute" TEXT,
    "eventType" TEXT,
    "teamId" INTEGER,
    "playerId" INTEGER,
    "teamName" TEXT,
    "playerFirstName" TEXT,
    "playerLastName" TEXT,
    "playerPos" TEXT,
    "playerRating" INTEGER,
    "shotArea" TEXT,
    "shotType" TEXT,
    "eventLeadUp" TEXT,
    "xG" DOUBLE PRECISION,
    "xGOT" DOUBLE PRECISION,
    "bigChance" BOOLEAN,
    "outcome" TEXT,
    "score" TEXT,
    "aPlayerFN" TEXT,
    "aPlayerLN" TEXT,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchWeek_leagueId_seasonId_weekNumber_key" ON "public"."MatchWeek"("leagueId", "seasonId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FixtureMatchStats_fixtureId_key" ON "public"."FixtureMatchStats"("fixtureId");

-- AddForeignKey
ALTER TABLE "public"."Fixture" ADD CONSTRAINT "Fixture_matchWeekId_fkey" FOREIGN KEY ("matchWeekId") REFERENCES "public"."MatchWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FixtureMatchStats" ADD CONSTRAINT "FixtureMatchStats_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."Fixture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchEvent" ADD CONSTRAINT "MatchEvent_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "public"."Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
