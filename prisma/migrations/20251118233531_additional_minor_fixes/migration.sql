/*
  Warnings:

  - A unique constraint covering the columns `[fixtureId,minuteStr,playerId,shotArea,shotType,eventLeadUp,xG,outcome]` on the table `MatchEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MatchEvent_fixtureId_minuteStr_teamId_playerId_shotArea_sho_key";

-- CreateIndex
CREATE UNIQUE INDEX "MatchEvent_fixtureId_minuteStr_playerId_shotArea_shotType_e_key" ON "MatchEvent"("fixtureId", "minuteStr", "playerId", "shotArea", "shotType", "eventLeadUp", "xG", "outcome");
