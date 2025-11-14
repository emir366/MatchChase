-- CreateTable
CREATE TABLE "GkPerf" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "homeGkName" TEXT,
    "awayGkName" TEXT,
    "homeGkRating" INTEGER,
    "awayGkRating" INTEGER,
    "homeGkSaves" INTEGER,
    "awayGkSaves" INTEGER,

    CONSTRAINT "GkPerf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GkPerf_fixtureId_key" ON "GkPerf"("fixtureId");

-- AddForeignKey
ALTER TABLE "GkPerf" ADD CONSTRAINT "GkPerf_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
