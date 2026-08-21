export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('all') === 'true';

    const collections = await prisma.restaurantCollection.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, emoji, restaurantIds, isPublished } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const newCollection = await prisma.restaurantCollection.create({
      data: {
        title,
        description: description || '',
        emoji: emoji || '🎯',
        isPublished: isPublished ?? true,
        restaurantIds: Array.isArray(restaurantIds) ? JSON.stringify(restaurantIds) : restaurantIds || '[]',
      },
    });

    return NextResponse.json({ success: true, data: newCollection });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ success: false, error: 'Failed to create collection' }, { status: 500 });
  }
}
