export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { name, city, order } = body;

    const dataToUpdate: any = {};
    if (typeof name === 'string' && name.trim()) dataToUpdate.name = name.trim();
    if (typeof city === 'string') dataToUpdate.city = city.trim();
    if (typeof order === 'number') dataToUpdate.order = order;

    const updated = await prisma.area.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { restaurants: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating area:', error);
    return NextResponse.json({ success: false, error: 'Failed to update area' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.area.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Area deleted successfully' });
  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete area' }, { status: 500 });
  }
}
