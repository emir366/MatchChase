/*
  Warnings:

  - You are about to drop the column `secondaryPos` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `contractEnd` on the `SquadMembership` table. All the data in the column will be lost.
  - You are about to drop the column `shirtNumber` on the `SquadMembership` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SquadMembership` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Player" DROP COLUMN "secondaryPos",
ADD COLUMN     "DOB" TEXT,
ADD COLUMN     "contractExpiry" TEXT,
ADD COLUMN     "currentMV" INTEGER,
ADD COLUMN     "prevClub" TEXT,
ADD COLUMN     "prevMV" INTEGER,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "transferDate" TEXT,
ADD COLUMN     "transferFee" TEXT;

-- AlterTable
ALTER TABLE "public"."SquadMembership" DROP COLUMN "contractEnd",
DROP COLUMN "shirtNumber",
DROP COLUMN "status";
