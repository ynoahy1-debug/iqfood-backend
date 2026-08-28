export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ALL_IRAQI_GOVERNORATES = [
  'بغداد',
  'أربيل',
  'البصرة',
  'السليمانية',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'نينوى (الموصل)',
  'كركوك',
  'بابل (الحلة)',
  'دهوك',
  'الأنبار (الرمادي/الفلوجة)',
  'صلاح الدين (تكريت/سامراء)',
  'ديالى (بعقوبة)',
  'ذي قار (الناصرية)',
  'ميسان (العمارة)',
  'المثنى (السماوة)',
  'القادسية (الديوانية)',
  'واسط (الكوت)',
];

const DEFAULT_AREAS_BY_GOVERNORATE: { city: string; areas: string[] }[] = [
  {
    city: 'بغداد',
    areas: [
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
    ],
  },
  {
    city: 'أربيل',
    areas: [
      'عينكاوة',
      'شارع 100م',
      'شارع 60م',
      'شارع 40م',
      'بختياري',
      'دريم سيتي',
      'إمباير وورلد',
      'وزيران',
      'كسنزان',
      'القرية الإنجليزية',
      'القرية الإيطالية',
      'شورش',
    ],
  },
  {
    city: 'البصرة',
    areas: [
      'الجزائر',
      'العشار',
      'مناوي باشا',
      'البراضعية',
      'الطويسة',
      'الجنينة',
      'التحسينية',
      'الزبير',
      'حي الأندلس',
      'الجبيلة',
      'حي الخليج',
      'المعقل',
    ],
  },
  {
    city: 'النجف الأشرف',
    areas: [
      'الكوفة',
      'الحنانة',
      'حي الأمير',
      'حي السعد',
      'شارع الغدير',
      'المدينة القديمة',
      'حي العدالة',
      'حي الوفاء',
      'حي الاشتراكي',
    ],
  },
  {
    city: 'كربلاء المقدسة',
    areas: [
      'شارع السناتر',
      'حي الحسين',
      'حي الإسكان',
      'حي المعلمين',
      'العباسية',
      'حي النقيب',
      'حي رمضان',
      'طريق بغداد - كربلاء',
      'حي الموظفين',
    ],
  },
  {
    city: 'السليمانية',
    areas: [
      'شارع سالم',
      'سرجنار',
      'بختياري',
      'رابرين',
      'كويزة',
      'إبراهيم أحمد',
      'طاسلوجة',
    ],
  },
  {
    city: 'نينوى (الموصل)',
    areas: [
      'المجموعة الثقافية',
      'حي الزهور',
      'حي النور',
      'حي الضباط',
      'الدواسة',
      'الغابات',
      'حي السكر',
    ],
  },
  {
    city: 'بابل (الحلة)',
    areas: [
      'حي المهندسين',
      'حي الإسكان',
      'شارع 40',
      'شارع 60',
      'حي الجمعية',
      'حي الكرامة',
      'حي بابل',
    ],
  },
  {
    city: 'كركوك',
    areas: [
      'طريق بغداد',
      'حي الواسطي',
      'القورية',
      'حي المعلمين',
      'رحيم آوا',
      'شارع القدس',
    ],
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    const where: any = {};
    if (city && city.trim() !== 'الكل' && city.trim() !== 'All') {
      where.city = city.trim();
    }

    let areas = await prisma.area.findMany({
      where,
      orderBy: [{ city: 'asc' }, { order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { restaurants: true },
        },
      },
    });

    // Auto-seed default Iraqi areas across governorates if none exist
    if (areas.length === 0 && !city) {
      let orderCounter = 0;
      for (const group of DEFAULT_AREAS_BY_GOVERNORATE) {
        for (const areaName of group.areas) {
          await prisma.area.upsert({
            where: { name: areaName },
            update: { city: group.city },
            create: {
              name: areaName,
              city: group.city,
              order: orderCounter++,
            },
          });
        }
      }

      areas = await prisma.area.findMany({
        orderBy: [{ city: 'asc' }, { order: 'asc' }, { name: 'asc' }],
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
      return NextResponse.json({ success: false, error: 'اسم المنطقة مطلوب' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedCity = city ? city.trim() : 'بغداد';

    const existing = await prisma.area.findUnique({ where: { name: trimmedName } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'هذه المنطقة مضافة بالفعل مسبقاً' }, { status: 400 });
    }

    const newArea = await prisma.area.create({
      data: {
        name: trimmedName,
        city: trimmedCity,
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
