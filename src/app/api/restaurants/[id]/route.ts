export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const body = await request.json();
    const { name, category, city, address, phone, workingHours, averageRating, isFrozen, image } = body;

    const dataToUpdate: any = {};
    if (typeof name === 'string') dataToUpdate.name = name;
    if (typeof category === 'string') dataToUpdate.category = category;
    if (typeof city === 'string') dataToUpdate.city = city;
    if (typeof address === 'string') dataToUpdate.address = address;
    if (typeof phone === 'string') dataToUpdate.phone = phone;
    if (typeof workingHours === 'string') dataToUpdate.workingHours = workingHours;
    if (typeof averageRating === 'number') dataToUpdate.averageRating = averageRating;
    if (typeof isFrozen === 'boolean') dataToUpdate.isFrozen = isFrozen;
    if (typeof image === 'string') dataToUpdate.image = image;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ success: false, error: 'Failed to update restaurant' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    return NextResponse.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete restaurant' }, { status: 500 });
  }
}
