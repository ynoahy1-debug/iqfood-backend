export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';
    const now = new Date();

    const whereClause: any = {};
    if (!includeAll) {
      whereClause.isActive = true;
      whereClause.OR = [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ];
    }

    const stories = await prisma.restaurantStory.findMany({
      where: whereClause,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, image, caption, durationHours = 24, order = 0 } = body;

    if (!restaurantId || !image) {
      return NextResponse.json({ success: false, error: 'Restaurant and image are required' }, { status: 400 });
    }

    const hours = Number(durationHours) || 24;
    const expiresAt = hours > 0 ? new Date(Date.now() + hours * 3600 * 1000) : null;

    const newStory = await prisma.restaurantStory.create({
      data: {
        restaurantId,
        image,
        caption: caption || '',
        durationHours: hours,
        expiresAt,
        order: Number(order) || 0,
        isActive: true,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            image: true,
            category: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newStory });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ success: false, error: 'Failed to create story' }, { status: 500 });
  }
}
