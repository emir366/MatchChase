/*
  Warnings:

  - The `marketValue` column on the `Transfer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Transfer" DROP COLUMN "marketValue",
ADD COLUMN     "marketValue" DOUBLE PRECISION;
