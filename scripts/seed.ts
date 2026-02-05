// Seed script to initialize a default player with rack units and environment

import { PrismaClient } from '@prisma/client';
import { GAME_CONFIG } from '../lib/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default player
  const player = await prisma.player.create({
    data: {
      gaiaBalance: GAME_CONFIG.STARTING_GAIA,
      energyCostPerHour: 0,
      lastTickTime: new Date(),
    },
  });

  console.log(`✅ Created player with ID: ${player.id}`);

  // Create 9 rack units (3x3 grid)
  for (let i = 0; i < GAME_CONFIG.RACK_SLOTS; i++) {
    await prisma.rackUnit.create({
      data: {
        playerId: player.id,
        slotIndex: i,
        isEmpty: true,
      },
    });
  }

  console.log(`✅ Created ${GAME_CONFIG.RACK_SLOTS} rack units`);

  // Create environmental parameters
  await prisma.environmentalParameters.create({
    data: {
      playerId: player.id,
      waterLevel: 100,
      phLevel: 6.0,
      nutrientPPM: 1500,
      lightingIntensity: 80,
      lastUpdated: new Date(),
    },
  });

  console.log('✅ Created environmental parameters');
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
