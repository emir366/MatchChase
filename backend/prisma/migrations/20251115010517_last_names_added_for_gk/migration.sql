/*
  Warnings:

  - You are about to drop the column `awayGkName` on the `GkPerf` table. All the data in the column will be lost.
  - You are about to drop the column `homeGkName` on the `GkPerf` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GkPerf" DROP COLUMN "awayGkName",
DROP COLUMN "homeGkName",
ADD COLUMN     "awayGkFn" TEXT,
ADD COLUMN     "awayGkLn" TEXT,
ADD COLUMN     "homeGkFn" TEXT,
ADD COLUMN     "homeGkLn" TEXT;
