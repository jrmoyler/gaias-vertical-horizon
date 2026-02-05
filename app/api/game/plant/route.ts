// API route to plant a crop in a rack unit
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CROP_TYPES, type CropTypeKey } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { rackUnitId, cropType } = await request.json();

    if (!rackUnitId || !cropType) {
      return NextResponse.json(
        { error: 'Missing rackUnitId or cropType' },
        { status: 400 }
      );
    }

    // Validate crop type
    if (!(cropType in CROP_TYPES)) {
      return NextResponse.json({ error: 'Invalid crop type' }, { status: 400 });
    }

    const cropConfig = CROP_TYPES[cropType as CropTypeKey];

    // Get player and rack unit
    const rackUnit = await prisma.rackUnit.findUnique({
      where: { id: rackUnitId },
      include: { player: true, crop: true },
    });

    if (!rackUnit) {
      return NextResponse.json({ error: 'Rack unit not found' }, { status: 404 });
    }

    if (!rackUnit.isEmpty || rackUnit.crop) {
      return NextResponse.json(
        { error: 'Rack unit is not empty' },
        { status: 400 }
      );
    }

    // Check if player has enough $GAIA
    if (rackUnit.player.gaiaBalance < cropConfig.seedCost) {
      return NextResponse.json(
        { error: 'Insufficient $GAIA balance' },
        { status: 400 }
      );
    }

    // Deduct seed cost and plant crop
    const [updatedPlayer, crop] = await prisma.$transaction([
      prisma.player.update({
        where: { id: rackUnit.playerId },
        data: {
          gaiaBalance: {
            decrement: cropConfig.seedCost,
          },
        },
      }),
      prisma.crop.create({
        data: {
          rackUnitId: rackUnit.id,
          cropType,
          growthStage: 'seed',
          progressPercent: 0,
          environmentalScore: 100,
          plantedAt: new Date(),
        },
      }),
      prisma.rackUnit.update({
        where: { id: rackUnit.id },
        data: { isEmpty: false },
      }),
    ]);

    return NextResponse.json({ success: true, crop, player: updatedPlayer });
  } catch (error) {
    console.error('Error planting crop:', error);
    return NextResponse.json(
      { error: 'Failed to plant crop' },
      { status: 500 }
    );
  }
}
