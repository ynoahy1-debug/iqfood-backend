import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = params.id;
    const body = await request.json();
    const { title, description, emoji, isPublished, restaurantIds } = body;

    const dataToUpdate: any = {};
    if (typeof title === 'string') dataToUpdate.title = title;
    if (typeof description === 'string') dataToUpdate.description = description;
    if (typeof emoji === 'string') dataToUpdate.emoji = emoji;
    if (typeof isPublished === 'boolean') dataToUpdate.isPublished = isPublished;
    if (restaurantIds !== undefined) {
      dataToUpdate.restaurantIds = Array.isArray(restaurantIds)
        ? JSON.stringify(restaurantIds)
        : restaurantIds;
    }

    const updated = await prisma.restaurantCollection.update({
      where: { id: collectionId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ success: false, error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collectionId = params.id;
    await prisma.restaurantCollection.delete({
      where: { id: collectionId },
    });

    return NextResponse.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete collection' }, { status: 500 });
  }
}
