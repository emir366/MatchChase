/*
  Warnings:

  - Added the required column `weekNumber` to the `Fixture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Fixture" ADD COLUMN     "weekNumber" INTEGER NOT NULL;
