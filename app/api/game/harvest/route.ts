// API route to harvest a crop
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateQualityGrade, calculateHarvestValue } from '@/lib/game-logic';
import { type CropTypeKey, type QualityGradeKey } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { cropId } = await request.json();

    if (!cropId) {
      return NextResponse.json({ error: 'Missing cropId' }, { status: 400 });
    }

    // Get crop with rack unit and player
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: {
        rackUnit: {
          include: {
            player: true,
          },
        },
      },
    });

    if (!crop) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    if (crop.growthStage !== 'harvest_ready') {
      return NextResponse.json(
        { error: 'Crop is not ready to harvest' },
        { status: 400 }
      );
    }

    // Calculate quality grade and harvest value
    const qualityGrade = calculateQualityGrade(crop.environmentalScore);
    const harvestValue = calculateHarvestValue(
      crop.cropType as CropTypeKey,
      qualityGrade as QualityGradeKey
    );

    // Update player balance and remove crop
    const [updatedPlayer] = await prisma.$transaction([
      prisma.player.update({
        where: { id: crop.rackUnit.playerId },
        data: {
          gaiaBalance: {
            increment: harvestValue,
          },
        },
      }),
      prisma.crop.delete({
        where: { id: cropId },
      }),
      prisma.rackUnit.update({
        where: { id: crop.rackUnitId },
        data: { isEmpty: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      qualityGrade,
      harvestValue,
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('Error harvesting crop:', error);
    return NextResponse.json(
      { error: 'Failed to harvest crop' },
      { status: 500 }
    );
  }
}
