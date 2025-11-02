/*
  Warnings:

  - You are about to drop the column `DOB` on the `Player` table. All the data in the column will be lost.
  - The `dateOfBirth` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Player" DROP COLUMN "DOB",
DROP COLUMN "dateOfBirth",
ADD COLUMN     "dateOfBirth" TIMESTAMP(3);
