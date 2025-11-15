/*
  Warnings:

  - A unique constraint covering the columns `[fixtureId,minuteStr,xG]` on the table `MatchEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MatchEvent_fixtureId_minuteStr_xG_key" ON "MatchEvent"("fixtureId", "minuteStr", "xG");
