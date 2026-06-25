import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const fixtureId = 493;
    const fixture = await prisma.fixture.findUnique({
        where: { id: fixtureId },
        include: { matchStats: true },
    });

    if (!fixture) {
        console.log(`Fixture ${fixtureId} not found.`);
        return;
    }

    console.log(`Fixture: ${fixture.homeTeamName} vs ${fixture.awayTeamName}`);
    console.log('Stats:', fixture.matchStats);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
