/*
  Warnings:

  - You are about to drop the column `leagueId` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `awayTeamId` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamId` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `leagueId` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `homBbigChance` on the `FixtureMatchStats` table. All the data in the column will be lost.
  - You are about to drop the column `leagueId` on the `MatchWeek` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `MatchWeek` table. All the data in the column will be lost.
  - You are about to drop the column `clubId` on the `SquadMembership` table. All the data in the column will be lost.
  - You are about to drop the column `seasonId` on the `SquadMembership` table. All the data in the column will be lost.
  - You are about to drop the column `fromClubId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `toClubId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the `leagues` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fixtureId,minuteStr,teamId,playerId,shotArea,shotType,eventLeadUp,xG,outcome]` on the table `MatchEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[leagueSeasonId,weekNumber]` on the table `MatchWeek` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clubSeasonId,playerId]` on the table `SquadMembership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerId,toClubSeasonId,date]` on the table `Transfer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nationId` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `awayClubSeasonId` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeClubSeasonId` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueSeasonId` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leagueSeasonId` to the `MatchWeek` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clubSeasonId` to the `SquadMembership` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Club" DROP CONSTRAINT "Club_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "SquadMembership" DROP CONSTRAINT "SquadMembership_clubId_fkey";

-- DropForeignKey
ALTER TABLE "SquadMembership" DROP CONSTRAINT "SquadMembership_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_fromClubId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_toClubId_fkey";

-- DropForeignKey
ALTER TABLE "leagues" DROP CONSTRAINT "leagues_nationId_fkey";

-- DropForeignKey
ALTER TABLE "leagues" DROP CONSTRAINT "leagues_seasonId_fkey";

-- DropIndex
DROP INDEX "MatchEvent_fixtureId_minuteStr_xG_key";

-- DropIndex
DROP INDEX "MatchWeek_leagueId_seasonId_weekNumber_key";

-- DropIndex
DROP INDEX "SquadMembership_seasonId_clubId_playerId_key";

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "leagueId",
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "nationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Fixture" DROP COLUMN "awayTeamId",
DROP COLUMN "homeTeamId",
DROP COLUMN "leagueId",
DROP COLUMN "seasonId",
ADD COLUMN     "awayClubSeasonId" INTEGER NOT NULL,
ADD COLUMN     "homeClubSeasonId" INTEGER NOT NULL,
ADD COLUMN     "leagueSeasonId" INTEGER NOT NULL,
ALTER COLUMN "matchWeekId" DROP NOT NULL,
ALTER COLUMN "weekNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FixtureMatchStats" DROP COLUMN "homBbigChance",
ADD COLUMN     "homeBigChance" INTEGER;

-- AlterTable
ALTER TABLE "MatchWeek" DROP COLUMN "leagueId",
DROP COLUMN "seasonId",
ADD COLUMN     "leagueSeasonId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "SquadMembership" DROP COLUMN "clubId",
DROP COLUMN "seasonId",
ADD COLUMN     "clubSeasonId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "fromClubId",
DROP COLUMN "toClubId",
ADD COLUMN     "fromClubSeasonId" INTEGER,
ADD COLUMN     "toClubSeasonId" INTEGER;

-- DropTable
DROP TABLE "leagues";

-- CreateTable
CREATE TABLE "ExternalIdentifier" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER,
    "entityKey" TEXT,
    "url" TEXT,
    "meta" JSONB,
    "lastSynced" TIMESTAMP(3),

    CONSTRAINT "ExternalIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nationId" INTEGER NOT NULL,
    "externalId" TEXT,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSeason" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "externalId" TEXT,

    CONSTRAINT "LeagueSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubSeason" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "leagueSeasonId" INTEGER NOT NULL,

    CONSTRAINT "ClubSeason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalIdentifier_entityType_entityId_idx" ON "ExternalIdentifier"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalIdentifier_provider_providerId_key" ON "ExternalIdentifier"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "League_externalId_key" ON "League"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeason_externalId_key" ON "LeagueSeason"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeason_leagueId_seasonId_key" ON "LeagueSeason"("leagueId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubSeason_clubId_leagueSeasonId_key" ON "ClubSeason"("clubId", "leagueSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_externalId_key" ON "Club"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchEvent_fixtureId_minuteStr_teamId_playerId_shotArea_sho_key" ON "MatchEvent"("fixtureId", "minuteStr", "teamId", "playerId", "shotArea", "shotType", "eventLeadUp", "xG", "outcome");

-- CreateIndex
CREATE UNIQUE INDEX "MatchWeek_leagueSeasonId_weekNumber_key" ON "MatchWeek"("leagueSeasonId", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Player_externalId_key" ON "Player"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMembership_clubSeasonId_playerId_key" ON "SquadMembership"("clubSeasonId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_playerId_toClubSeasonId_date_key" ON "Transfer"("playerId", "toClubSeasonId", "date");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "Nation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "Nation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubSeason" ADD CONSTRAINT "ClubSeason_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubSeason" ADD CONSTRAINT "ClubSeason_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadMembership" ADD CONSTRAINT "SquadMembership_clubSeasonId_fkey" FOREIGN KEY ("clubSeasonId") REFERENCES "ClubSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromClubSeasonId_fkey" FOREIGN KEY ("fromClubSeasonId") REFERENCES "ClubSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toClubSeasonId_fkey" FOREIGN KEY ("toClubSeasonId") REFERENCES "ClubSeason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchWeek" ADD CONSTRAINT "MatchWeek_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_homeClubSeasonId_fkey" FOREIGN KEY ("homeClubSeasonId") REFERENCES "ClubSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_awayClubSeasonId_fkey" FOREIGN KEY ("awayClubSeasonId") REFERENCES "ClubSeason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
