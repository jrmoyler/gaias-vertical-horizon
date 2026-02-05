// API route to adjust environmental parameters
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ENVIRONMENTAL_PARAMS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { action, playerId } = await request.json();

    if (!action || !playerId) {
      return NextResponse.json(
        { error: 'Missing action or playerId' },
        { status: 400 }
      );
    }

    // Get player and environment
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { environment: true },
    });

    if (!player || !player.environment) {
      return NextResponse.json(
        { error: 'Player or environment not found' },
        { status: 404 }
      );
    }

    const env = player.environment;
    let cost = 0;
    let updates: any = { lastUpdated: new Date() };

    switch (action) {
      case 'refill_water':
        cost = ENVIRONMENTAL_PARAMS.water.refillCost;
        updates.waterLevel = Math.min(
          100,
          env.waterLevel + ENVIRONMENTAL_PARAMS.water.refillAmount
        );
        break;

      case 'ph_up':
        cost = ENVIRONMENTAL_PARAMS.ph.adjustCost;
        updates.phLevel = Math.min(
          ENVIRONMENTAL_PARAMS.ph.max,
          env.phLevel + ENVIRONMENTAL_PARAMS.ph.adjustAmount
        );
        break;

      case 'ph_down':
        cost = ENVIRONMENTAL_PARAMS.ph.adjustCost;
        updates.phLevel = Math.max(
          ENVIRONMENTAL_PARAMS.ph.min,
          env.phLevel - ENVIRONMENTAL_PARAMS.ph.adjustAmount
        );
        break;

      case 'add_nutrients':
        cost = ENVIRONMENTAL_PARAMS.nutrient.addCost;
        updates.nutrientPPM = Math.min(
          ENVIRONMENTAL_PARAMS.nutrient.max,
          env.nutrientPPM + ENVIRONMENTAL_PARAMS.nutrient.addAmount
        );
        break;

      case 'adjust_lighting':
        const { intensity } = await request.json();
        if (intensity === undefined || intensity < 0 || intensity > 100) {
          return NextResponse.json(
            { error: 'Invalid lighting intensity' },
            { status: 400 }
          );
        }
        updates.lightingIntensity = intensity;
        cost = 0; // No immediate cost, but affects energy bill
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check if player has enough balance
    if (cost > 0 && player.gaiaBalance < cost) {
      return NextResponse.json(
        { error: 'Insufficient $GAIA balance' },
        { status: 400 }
      );
    }

    // Update environment and player balance
    let updatedPlayer = player;
    let updatedEnv;

    if (cost > 0) {
      const result = await prisma.$transaction([
        prisma.environmentalParameters.update({
          where: { id: env.id },
          data: updates,
        }),
        prisma.player.update({
          where: { id: playerId },
          data: {
            gaiaBalance: {
              decrement: cost,
            },
          },
        }),
      ]);
      updatedEnv = result[0];
      updatedPlayer = result[1] as any;
    } else {
      updatedEnv = await prisma.environmentalParameters.update({
        where: { id: env.id },
        data: updates,
      });
    }

    return NextResponse.json({
      success: true,
      environment: updatedEnv,
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('Error adjusting environment:', error);
    return NextResponse.json(
      { error: 'Failed to adjust environment' },
      { status: 500 }
    );
  }
}
