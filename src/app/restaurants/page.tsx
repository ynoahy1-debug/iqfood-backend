import { prisma } from '@/lib/prisma';
import React from 'react';
import RestaurantsManager from '@/components/RestaurantsManager';

export const revalidate = 0;

export default async function RestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { averageRating: 'desc' },
    include: {
      area: {
        select: { id: true, name: true, city: true },
      },
      _count: { select: { reviews: true } },
    },
  });

  const areas = await prisma.area.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, city: true },
  });

  const formatted = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    city: r.city,
    address: r.address,
    phone: r.phone,
    workingHours: r.workingHours,
    averageRating: r.averageRating,
    viewsCount: r.viewsCount ?? 0,
    isFrozen: (r as any).isFrozen ?? false,
    image: r.image,
    areaId: r.areaId,
    area: r.area,
    features: (r as any).features || [],
    _count: r._count,
  }));

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>🏪 إدارة المطاعم (المناطق، المميزات، التعديل، الحذف)</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            لوحة مخصصة لإضافة المطاعم، تحديد مناطق بغداد، اختيار المميزات والخدمات (بوفيه، صالة خارجية، ألعاب، واي فاي)، والتعديل الشامل.
          </p>
        </div>
        <span className="title-badge" style={{ background: '#38bdf8', color: '#0f172a' }}>
          Restaurant & Features Control
        </span>
      </header>

      <RestaurantsManager initialRestaurants={formatted} availableAreas={areas} />
    </div>
  );
}
