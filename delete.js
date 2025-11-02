// deletePlayer.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUnknownPlayers() {
  try {
    const players = await prisma.player.findMany({
      where: { firstName: "Unknown" },
      include: { squads: true, transfers: true }
    });

    console.log(`Found ${players.length} players with first name "Unknown"`);

    for (const player of players) {
      // Delete related records
      await prisma.transfer.deleteMany({ where: { playerId: player.id } });
      await prisma.squadMembership.deleteMany({ where: { playerId: player.id } });
      await prisma.player.delete({ where: { id: player.id } });
      console.log(`Deleted: ${player.firstName} ${player.lastName}`);
    }

    console.log(`Successfully deleted ${players.length} players.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUnknownPlayers();