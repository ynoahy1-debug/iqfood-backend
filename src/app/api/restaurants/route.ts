export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const area = searchParams.get('area');
    const areaId = searchParams.get('areaId');
    const search = searchParams.get('search');
    const featuresParam = searchParams.get('features');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy');

    const where: any = { isFrozen: false };

    if (category && category.trim() !== 'All' && category.trim() !== 'الكل') {
      where.category = category.trim();
    }

    if (areaId) {
      where.areaId = areaId;
    } else if (area && area.trim() !== 'All' && area.trim() !== 'الكل') {
      where.OR = [
        { area: { name: area.trim() } },
        { address: { contains: area.trim(), mode: 'insensitive' } },
      ];
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { area: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (minRating) {
      const r = parseFloat(minRating);
      if (!isNaN(r)) {
        where.averageRating = { gte: r };
      }
    }

    if (featuresParam) {
      const reqFeatures = featuresParam.split(',').map((f) => f.trim()).filter(Boolean);
      if (reqFeatures.length > 0) {
        where.features = {
          hasEvery: reqFeatures,
        };
      }
    }

    let orderBy: any = [{ averageRating: 'desc' }, { viewsCount: 'desc' }];
    if (sortBy === 'views') {
      orderBy = [{ viewsCount: 'desc' }, { averageRating: 'desc' }];
    } else if (sortBy === 'newest') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sortBy === 'rating') {
      orderBy = [{ averageRating: 'desc' }, { viewsCount: 'desc' }];
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      orderBy,
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

    return NextResponse.json({ success: true, data: restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
      areaId,
      features = [],
    } = body;

    if (!name || !category || !image) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        category: category.trim(),
        city: city?.trim() || 'بغداد',
        address: address?.trim() || '',
        phone: phone?.trim() || '07700000000',
        workingHours: workingHours?.trim() || '12:00 م - 12:00 ص',
        latitude: parseFloat(latitude) || 33.3152,
        longitude: parseFloat(longitude) || 44.3661,
        image,
        areaId: areaId || null,
        features: Array.isArray(features) ? features : [],
      },
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

    return NextResponse.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json({ success: false, error: 'Failed to create restaurant' }, { status: 500 });
  }
}
