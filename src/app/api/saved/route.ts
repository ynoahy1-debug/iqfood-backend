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
    const { userId, restaurantId, type = 'favorite', action } = await request.json();

    if (!userId || !restaurantId) {
      return NextResponse.json({ success: false, error: 'Missing userId or restaurantId' }, { status: 400 });
    }

    let validUserId = userId;
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) validUserId = firstUser.id;
    }

    if (action === 'remove') {
      await prisma.savedRestaurant.deleteMany({
        where: { userId: validUserId, restaurantId, type },
      });
      return NextResponse.json({ success: true, isSaved: false, message: 'Removed' });
    } else if (action === 'add') {
      const entry = await prisma.savedRestaurant.upsert({
        where: {
          userId_restaurantId_type: { userId: validUserId, restaurantId, type },
        },
        update: {},
        create: { userId: validUserId, restaurantId, type },
      });
      return NextResponse.json({ success: true, isSaved: true, data: entry });
    } else {
      // Auto toggle
      const existing = await prisma.savedRestaurant.findUnique({
        where: {
          userId_restaurantId_type: { userId: validUserId, restaurantId, type },
        },
      });

      if (existing) {
        await prisma.savedRestaurant.delete({
          where: {
            userId_restaurantId_type: { userId: validUserId, restaurantId, type },
          },
        });
        return NextResponse.json({ success: true, isSaved: false });
      } else {
        const entry = await prisma.savedRestaurant.create({
          data: { userId: validUserId, restaurantId, type },
        });
        return NextResponse.json({ success: true, isSaved: true, data: entry });
      }
    }
  } catch (error) {
    console.error('Error toggling saved:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
