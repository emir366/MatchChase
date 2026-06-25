/*
  Warnings:

  - The `contractExpiry` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Player" DROP COLUMN "contractExpiry",
ADD COLUMN     "contractExpiry" TIMESTAMP(3);
