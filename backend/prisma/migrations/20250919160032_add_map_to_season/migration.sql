/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Nation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seasonId` to the `League` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."League" ADD COLUMN     "seasonId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."seasons" (
    "id" SERIAL NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Player" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "birthPlace" TEXT,
    "nationalityId" INTEGER,
    "age" INTEGER,
    "heightCm" INTEGER,
    "weightKg" INTEGER,
    "position" TEXT,
    "secondaryPos" TEXT,
    "transfermarktId" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SquadMembership" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "shirtNumber" INTEGER,
    "status" TEXT,
    "contractEnd" TIMESTAMP(3),

    CONSTRAINT "SquadMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transfer" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "fromClubId" INTEGER,
    "toClubId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "fee" TEXT,
    "marketValue" TEXT,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_transfermarktId_key" ON "public"."Player"("transfermarktId");

-- CreateIndex
CREATE UNIQUE INDEX "SquadMembership_seasonId_clubId_playerId_key" ON "public"."SquadMembership"("seasonId", "clubId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Nation_name_key" ON "public"."Nation"("name");

-- AddForeignKey
ALTER TABLE "public"."League" ADD CONSTRAINT "League_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Player" ADD CONSTRAINT "Player_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "public"."Nation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SquadMembership" ADD CONSTRAINT "SquadMembership_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SquadMembership" ADD CONSTRAINT "SquadMembership_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SquadMembership" ADD CONSTRAINT "SquadMembership_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transfer" ADD CONSTRAINT "Transfer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transfer" ADD CONSTRAINT "Transfer_fromClubId_fkey" FOREIGN KEY ("fromClubId") REFERENCES "public"."Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transfer" ADD CONSTRAINT "Transfer_toClubId_fkey" FOREIGN KEY ("toClubId") REFERENCES "public"."Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
