export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_BAGHDAD_AREAS = [
  'الكرادة',
  'المنصور',
  'شارع فلسطين',
  'اليرموك',
  'الجادرية',
  'زيونة',
  'الأعظمية',
  'الكاظمية',
  'الحارثية',
  'العرصات',
  'الغزالية',
  'العامرية',
  'السيدية',
  'الدورة',
  'حي الجامعة',
  'الشعب',
  'البلديات',
  'الغدير',
  'الصالحية',
  'المسبح',
  'القادسية',
  'شارع 14 رمضان',
  'بغداد الجديدة',
];

export async function GET() {
  try {
    let areas = await prisma.area.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { restaurants: true },
        },
      },
    });

    // Auto-seed default Baghdad areas if table is empty
    if (areas.length === 0) {
      for (let i = 0; i < DEFAULT_BAGHDAD_AREAS.length; i++) {
        const areaName = DEFAULT_BAGHDAD_AREAS[i];
        await prisma.area.upsert({
          where: { name: areaName },
          update: {},
          create: {
            name: areaName,
            city: 'بغداد',
            order: i,
          },
        });
      }
      areas = await prisma.area.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { restaurants: true },
          },
        },
      });
    }

    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch areas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, city = 'بغداد', order = 0 } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Area name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const existing = await prisma.area.findUnique({ where: { name: trimmedName } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'المنطقة موجودة بالفعل مسبقاً' }, { status: 400 });
    }

    const newArea = await prisma.area.create({
      data: {
        name: trimmedName,
        city: city.trim() || 'بغداد',
        order: Number(order) || 0,
      },
      include: {
        _count: {
          select: { restaurants: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: newArea });
  } catch (error) {
    console.error('Error creating area:', error);
    return NextResponse.json({ success: false, error: 'Failed to create area' }, { status: 500 });
  }
}
