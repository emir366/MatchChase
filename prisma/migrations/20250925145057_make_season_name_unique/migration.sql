/*
  Warnings:

  - The `transferDate` column on the `Player` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[name]` on the table `seasons` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Player" DROP COLUMN "transferDate",
ADD COLUMN     "transferDate" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "seasons_name_key" ON "public"."seasons"("name");
