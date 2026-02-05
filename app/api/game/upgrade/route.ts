// API route to purchase upgrades
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UPGRADES, type UpgradeTypeKey } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { playerId, upgradeType } = await request.json();

    if (!playerId || !upgradeType) {
      return NextResponse.json(
        { error: 'Missing playerId or upgradeType' },
        { status: 400 }
      );
    }

    // Validate upgrade type
    if (!(upgradeType in UPGRADES)) {
      return NextResponse.json(
        { error: 'Invalid upgrade type' },
        { status: 400 }
      );
    }

    const upgradeConfig = UPGRADES[upgradeType as UpgradeTypeKey];

    // Get player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Check if player has enough balance
    if (player.gaiaBalance < upgradeConfig.cost) {
      return NextResponse.json(
        { error: 'Insufficient $GAIA balance' },
        { status: 400 }
      );
    }

    // Check if upgrade already exists
    const existingUpgrade = await prisma.upgrade.findUnique({
      where: {
        playerId_upgradeType: {
          playerId,
          upgradeType,
        },
      },
    });

    if (existingUpgrade) {
      return NextResponse.json(
        { error: 'Upgrade already purchased' },
        { status: 400 }
      );
    }

    // Purchase upgrade
    const [updatedPlayer, upgrade] = await prisma.$transaction([
      prisma.player.update({
        where: { id: playerId },
        data: {
          gaiaBalance: {
            decrement: upgradeConfig.cost,
          },
        },
      }),
      prisma.upgrade.create({
        data: {
          playerId,
          upgradeType,
          level: 1,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      upgrade,
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('Error purchasing upgrade:', error);
    return NextResponse.json(
      { error: 'Failed to purchase upgrade' },
      { status: 500 }
    );
  }
}
