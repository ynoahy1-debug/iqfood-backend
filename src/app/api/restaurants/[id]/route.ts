export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        area: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        reviews: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        stories: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ success: false, error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch restaurant' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const {
      name,
      description,
      category,
      city,
      address,
      phone,
      workingHours,
      latitude,
      longitude,
      image,
      averageRating,
      isFrozen,
      areaId,
      features,
    } = body;

    const dataToUpdate: any = {};
    if (typeof name === 'string' && name.trim()) dataToUpdate.name = name.trim();
    if (typeof description !== 'undefined') dataToUpdate.description = description ? description.trim() : null;
    if (typeof category === 'string' && category.trim()) dataToUpdate.category = category.trim();
    if (typeof city === 'string') dataToUpdate.city = city.trim();
    if (typeof address === 'string') dataToUpdate.address = address.trim();
    if (typeof phone === 'string') dataToUpdate.phone = phone.trim();
    if (typeof workingHours === 'string') dataToUpdate.workingHours = workingHours.trim();
    if (typeof latitude !== 'undefined') dataToUpdate.latitude = parseFloat(latitude) || 33.3152;
    if (typeof longitude !== 'undefined') dataToUpdate.longitude = parseFloat(longitude) || 44.3661;
    if (typeof image === 'string' && image.trim()) dataToUpdate.image = image;
    if (typeof averageRating !== 'undefined') dataToUpdate.averageRating = parseFloat(averageRating) || 0.0;
    if (typeof isFrozen === 'boolean') dataToUpdate.isFrozen = isFrozen;
    if (typeof areaId !== 'undefined') dataToUpdate.areaId = areaId || null;
    if (Array.isArray(features)) dataToUpdate.features = features;

    const updated = await prisma.restaurant.update({
      where: { id },
      data: dataToUpdate,
      include: {
        area: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
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
    const id = params.id;
    await prisma.restaurant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete restaurant' }, { status: 500 });
  }
}
