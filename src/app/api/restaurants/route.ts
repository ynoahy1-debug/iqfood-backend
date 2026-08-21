export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'All';

    const whereClause: any = {
      isFrozen: false,
    };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { category: { contains: query } },
        { city: { contains: query } },
        { address: { contains: query } },
      ];
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      orderBy: { averageRating: 'desc' },
      include: {
        _count: { select: { reviews: true } },
      },
    });

    return NextResponse.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, city, address, phone, workingHours, image, rating } = body;

    if (!name || !category || !city) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newRestaurant = await prisma.restaurant.create({
      data: {
        name,
        category,
        city,
        address: address || 'العراق - بغداد',
        phone: phone || '07700000000',
        workingHours: workingHours || '12:00 م - 12:00 ص',
        latitude: 33.3152,
        longitude: 44.3661,
        image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        averageRating: parseFloat(rating || 5.0),
      },
    });

    return NextResponse.json({ success: true, data: newRestaurant });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ success: false, error: 'Failed to create restaurant' }, { status: 500 });
  }
}
