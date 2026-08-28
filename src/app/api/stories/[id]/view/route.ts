export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    if (!storyId) {
      return NextResponse.json({ success: false, error: 'Story ID is required' }, { status: 400 });
    }

    const updated = await prisma.restaurantStory.update({
      where: { id: storyId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewsCount: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error recording story view:', error);
    return NextResponse.json({ success: false, error: 'Failed to record story view' }, { status: 500 });
  }
}
