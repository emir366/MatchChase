// scripts/backfill_minute_text.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill of minuteStr from minute...');

  // 1) Count before
  const before = await prisma.$queryRaw`SELECT COUNT(*) AS total, SUM(CASE WHEN "minuteStr" IS NULL THEN 1 ELSE 0 END) AS without_minuteStr FROM "MatchEvent"`;
  console.log('Before:', before);

  // 2) Perform update. Uses raw SQL for performance.
  await prisma.$executeRawUnsafe(`
    UPDATE "MatchEvent"
    SET "minuteStr" = CASE WHEN "minute" IS NULL THEN NULL ELSE ("minute"::text) END
    WHERE "minuteStr" IS NULL;
  `);

  // 3) Verify after
  const after = await prisma.$queryRaw`SELECT COUNT(*) AS total, SUM(CASE WHEN "minuteStr" IS NULL THEN 1 ELSE 0 END) AS without_minuteStr FROM "MatchEvent"`;
  console.log('After:', after);

  await prisma.$disconnect();
  console.log('Backfill complete.');
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });

