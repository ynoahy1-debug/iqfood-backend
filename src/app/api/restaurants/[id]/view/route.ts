export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    if (!restaurantId) {
      return NextResponse.json({ success: false, error: 'Restaurant ID is required' }, { status: 400 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        name: true,
        viewsCount: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error incrementing restaurant view:', error);
    return NextResponse.json({ success: false, error: 'Failed to record view' }, { status: 500 });
  }
}
