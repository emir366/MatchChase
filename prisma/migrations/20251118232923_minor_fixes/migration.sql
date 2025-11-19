/*
  Warnings:

  - You are about to drop the column `age` on the `Player` table. All the data in the column will be lost.
  - The `fee` column on the `Transfer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "FixtureMatchStats" ALTER COLUMN "homePenaltyXG" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "awayPenaltyXG" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "age";

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "transferType" TEXT,
DROP COLUMN "fee",
ADD COLUMN     "fee" DOUBLE PRECISION;
