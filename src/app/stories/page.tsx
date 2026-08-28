import { prisma } from '@/lib/prisma';
import React from 'react';
import StoriesManager from '@/components/StoriesManager';

export const revalidate = 0;

export const metadata = {
  title: 'إدارة قصص المطاعم (Stories) | IQFood Admin',
};

export default async function StoriesPage() {
  const stories = await prisma.restaurantStory.findMany({
    orderBy: [
      { order: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          image: true,
          category: true,
          city: true,
        },
      },
    },
  });

  const availableRestaurants = await prisma.restaurant.findMany({
    where: { isFrozen: false },
    select: {
      id: true,
      name: true,
      category: true,
      city: true,
      image: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>📸 إدارة قصص واستوريات المطاعم (Stories)</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            تحكم بالكامل في القصص المعروضة بشريط الاستكشاف. حدد المطعم، الصورة، العرض، ومدة الظهور (24 ساعة أو أكثر)، مع حذف وإخفاء تلقائي بعد انتهاء الوقت!
          </p>
        </div>
        <span className="title-badge" style={{ background: 'linear-gradient(135deg, #ff4757, #ff6b81)' }}>
          24h Dynamic Stories Engine
        </span>
      </header>

      <StoriesManager initialStories={stories as any} availableRestaurants={availableRestaurants} />
    </div>
  );
}
