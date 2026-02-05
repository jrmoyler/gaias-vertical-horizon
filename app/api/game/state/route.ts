// API route to get current game state
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get the first player (single-player game)
    const player = await prisma.player.findFirst({
      include: {
        rackUnits: {
          include: {
            crop: true,
          },
          orderBy: {
            slotIndex: 'asc',
          },
        },
        environment: true,
        upgrades: true,
      },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
