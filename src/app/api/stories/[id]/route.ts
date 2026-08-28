export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    const body = await request.json();
    const { caption, image, isActive, order, durationHours, expiresAt, resetTimer } = body;

    const dataToUpdate: any = {};
    if (typeof caption === 'string') dataToUpdate.caption = caption;
    if (typeof image === 'string') dataToUpdate.image = image;
    if (typeof isActive === 'boolean') dataToUpdate.isActive = isActive;
    if (typeof order === 'number') dataToUpdate.order = order;
    if (typeof durationHours === 'number') dataToUpdate.durationHours = durationHours;

    if (resetTimer && typeof durationHours === 'number') {
      dataToUpdate.expiresAt = durationHours > 0 ? new Date(Date.now() + durationHours * 3600 * 1000) : null;
    } else if (expiresAt !== undefined) {
      dataToUpdate.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const updated = await prisma.restaurantStory.update({
      where: { id: storyId },
      data: dataToUpdate,
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ success: false, error: 'Failed to update story' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const storyId = params.id;
    await prisma.restaurantStory.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete story' }, { status: 500 });
  }
}
