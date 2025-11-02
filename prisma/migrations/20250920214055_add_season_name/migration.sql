/*
  Warnings:

  - You are about to drop the column `yearEnd` on the `seasons` table. All the data in the column will be lost.
  - You are about to drop the column `yearStart` on the `seasons` table. All the data in the column will be lost.
  - Added the required column `name` to the `seasons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: First add the new column and remove old columns
ALTER TABLE "public"."seasons" 
DROP COLUMN "yearEnd",
DROP COLUMN "yearStart",
ADD COLUMN "name" TEXT;

-- Update existing NULL values in the new name column
UPDATE "public"."seasons" SET "name" = 'Default Season' WHERE "name" IS NULL;

-- Make the name column required (NOT NULL)
ALTER TABLE "public"."seasons" 
ALTER COLUMN "name" SET NOT NULL;
