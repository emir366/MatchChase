/*
  Warnings:

  - You are about to drop the `League` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Club" DROP CONSTRAINT "Club_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."League" DROP CONSTRAINT "League_nationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."League" DROP CONSTRAINT "League_seasonId_fkey";

-- DropTable
DROP TABLE "public"."League";

-- CreateTable
CREATE TABLE "public"."leagues" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nationId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,

    CONSTRAINT "leagues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leagues_name_nationId_seasonId_key" ON "public"."leagues"("name", "nationId", "seasonId");

-- AddForeignKey
ALTER TABLE "public"."leagues" ADD CONSTRAINT "leagues_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "public"."Nation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leagues" ADD CONSTRAINT "leagues_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Club" ADD CONSTRAINT "Club_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "public"."leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
