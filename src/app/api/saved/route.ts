export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const saved = await prisma.savedRestaurant.findMany({
      where: { userId },
      include: { restaurant: true },
    });

    const visited = saved.filter((s) => s.type === 'visited').map((s) => s.restaurant);
    const wantToTry = saved.filter((s) => s.type === 'want_to_try').map((s) => s.restaurant);
    const favorite = saved.filter((s) => s.type === 'favorite').map((s) => s.restaurant);

    return NextResponse.json({
      success: true,
      data: { visited, wantToTry, favorite },
    });
  } catch (error) {
    console.error('Error fetching saved:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, restaurantId, type, action } = await request.json();

    if (!userId || !restaurantId || !type) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    if (action === 'remove') {
      await prisma.savedRestaurant.deleteMany({
        where: { userId, restaurantId, type },
      });
      return NextResponse.json({ success: true, message: 'Removed' });
    } else {
      const entry = await prisma.savedRestaurant.upsert({
        where: {
          userId_restaurantId_type: { userId, restaurantId, type },
        },
        update: {},
        create: { userId, restaurantId, type },
      });
      return NextResponse.json({ success: true, data: entry });
    }
  } catch (error) {
    console.error('Error toggling saved:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
