// API route to run game simulation tick
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  calculateGrowthProgress,
  determineGrowthStage,
  calculateEnvironmentalImpact,
  updateEnvironmentalParameters,
  calculateEnergyCost,
} from '@/lib/game-logic';
import { ENVIRONMENTAL_PARAMS, type CropTypeKey } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Missing playerId' }, { status: 400 });
    }

    // Get player with all related data
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        rackUnits: {
          include: {
            crop: true,
          },
        },
        environment: true,
        upgrades: true,
      },
    });

    if (!player || !player.environment) {
      return NextResponse.json(
        { error: 'Player or environment not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const lastTick = player.lastTickTime;
    const secondsElapsed = (now.getTime() - lastTick.getTime()) / 1000;

    // Count active crops
    const activeCrops = player.rackUnits.filter((ru: any) => ru.crop);
    const activeCropCount = activeCrops.length;

    // Check upgrades
    const hasAutoWater = player.upgrades.some(
      (u: any) => u.upgradeType === 'auto_water'
    );
    const hasAutoNutrient = player.upgrades.some(
      (u: any) => u.upgradeType === 'auto_nutrient'
    );
    const hasPhStabilizer = player.upgrades.some(
      (u: any) => u.upgradeType === 'ph_stabilizer'
    );
    const hasEfficientLighting = player.upgrades.some(
      (u: any) => u.upgradeType === 'efficient_lighting'
    );

    // Update environmental parameters
    let updatedEnv = updateEnvironmentalParameters(
      {
        waterLevel: player.environment.waterLevel,
        phLevel: player.environment.phLevel,
        nutrientPPM: player.environment.nutrientPPM,
        lightingIntensity: player.environment.lightingIntensity,
      },
      activeCropCount,
      secondsElapsed,
      { hasPhStabilizer }
    );

    // Apply auto-systems
    if (hasAutoWater && updatedEnv.waterLevel < 70) {
      updatedEnv.waterLevel = Math.min(
        100,
        updatedEnv.waterLevel + ENVIRONMENTAL_PARAMS.water.refillAmount
      );
    }

    if (hasAutoNutrient && updatedEnv.nutrientPPM < 1200) {
      updatedEnv.nutrientPPM = Math.min(
        ENVIRONMENTAL_PARAMS.nutrient.max,
        updatedEnv.nutrientPPM + ENVIRONMENTAL_PARAMS.nutrient.addAmount
      );
    }

    // Calculate environmental impact on crops
    const envImpact = calculateEnvironmentalImpact(
      updatedEnv.waterLevel,
      updatedEnv.phLevel,
      updatedEnv.nutrientPPM,
      player.environment.lightingIntensity
    );

    // Update crops
    const cropUpdates = activeCrops.map((rackUnit: any) => {
      if (!rackUnit.crop) return null;

      const crop = rackUnit.crop;
      const progress = calculateGrowthProgress(
        crop.cropType as CropTypeKey,
        crop.plantedAt,
        now
      );
      const stage = determineGrowthStage(progress);

      // Update environmental score (weighted average)
      const newEnvScore =
        crop.environmentalScore * 0.95 + envImpact * 0.05;

      return prisma.crop.update({
        where: { id: crop.id },
        data: {
          progressPercent: progress,
          growthStage: stage,
          environmentalScore: newEnvScore,
        },
      });
    }).filter(Boolean);

    // Calculate energy cost
    const energyCost = calculateEnergyCost(
      player.environment.lightingIntensity,
      hasEfficientLighting
    );

    // Deduct hourly energy cost (prorated)
    const energyDeduction = Math.floor(
      (energyCost * secondsElapsed) / 3600
    );

    // Execute all updates in transaction
    const validCropUpdates = cropUpdates.filter((update) => update !== null);
    
    await prisma.$transaction([
      prisma.environmentalParameters.update({
        where: { id: player.environment.id },
        data: {
          waterLevel: updatedEnv.waterLevel,
          phLevel: updatedEnv.phLevel,
          nutrientPPM: updatedEnv.nutrientPPM,
          lastUpdated: now,
        },
      }),
      prisma.player.update({
        where: { id: playerId },
        data: {
          lastTickTime: now,
          energyCostPerHour: energyCost,
          gaiaBalance: {
            decrement: energyDeduction,
          },
        },
      }),
      ...validCropUpdates,
    ] as any);

    return NextResponse.json({
      success: true,
      secondsElapsed,
      energyDeduction,
    });
  } catch (error) {
    console.error('Error running game tick:', error);
    return NextResponse.json(
      { error: 'Failed to run game tick' },
      { status: 500 }
    );
  }
}
