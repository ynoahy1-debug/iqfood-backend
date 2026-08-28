export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_CATEGORIES = [
  {
    name: 'All',
    label: 'جميع المطاعم',
    icon: '🍽️',
    order: 0,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  },
  {
    name: 'Burger',
    label: 'مطاعم البرغر',
    icon: '🍔',
    order: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
  },
  {
    name: 'Pizza',
    label: 'مطاعم البيتزا',
    icon: '🍕',
    order: 2,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
  },
  {
    name: 'Sushi',
    label: 'السوشي والياباني',
    icon: '🍣',
    order: 3,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600',
  },
  {
    name: 'Coffee',
    label: 'الكافيهات والقهوة',
    icon: '☕',
    order: 4,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
  },
  {
    name: 'Iraqi',
    label: 'المشويات والمطابخ العراقية',
    icon: '🥩',
    order: 5,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
  },
  {
    name: 'Desserts',
    label: 'الحلويات والكريب',
    icon: '🍰',
    order: 6,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
  },
];

export async function GET() {
  try {
    let categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    // Seed default categories if empty
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.category.create({ data: cat }).catch(() => {});
      }
      categories = await prisma.category.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });
    }

    // Get restaurant counts for each category
    const allRestaurants = await prisma.restaurant.findMany({
      select: { category: true },
    });

    const categoriesWithCount = categories.map((cat) => {
      const count =
        cat.name === 'All'
          ? allRestaurants.length
          : allRestaurants.filter(
              (r) =>
                r.category.toLowerCase().trim() === cat.name.toLowerCase().trim() ||
                r.category.trim() === cat.label.trim()
            ).length;
      return {
        ...cat,
        restaurantCount: count,
      };
    });

    return NextResponse.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, label, icon = '🍽️', image, order = 0 } = body;

    if (!name || !label) {
      return NextResponse.json({ success: false, error: 'Name and label are required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanLabel = label.trim();

    const existing = await prisma.category.findUnique({
      where: { name: cleanName },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'التصنيف بهذا الاسم موجود بالفعل' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: cleanName,
        label: cleanLabel,
        icon: icon || '🍽️',
        image: image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
  }
}
