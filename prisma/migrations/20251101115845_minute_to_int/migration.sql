/*
  Warnings:

  - The `minute` column on the `MatchEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."MatchEvent" DROP COLUMN "minute",
ADD COLUMN     "minute" INTEGER;
