import { prisma } from '@/lib/prisma';
import React from 'react';
import CollectionsManager from '@/components/CollectionsManager';

export const revalidate = 0;

export default async function CollectionsPage() {
  const collections = await prisma.restaurantCollection.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const restaurants = await prisma.restaurant.findMany({
    where: { isFrozen: false },
    select: { id: true, name: true, category: true, city: true, averageRating: true, image: true },
  });

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>🎯 إدارة القوائم المخصصة والسلاسل (Curated Collections)</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            أنشئ وسيّطر على أي قائمة مطاعم مخصصة (مثال: أفضل 10 مطاعم أكل صحي 🥗، أفضل أماكن بيتزا 🍕)، ونشّرها أو أوقفها وقتما تشاء!
          </p>
        </div>
        <span className="title-badge" style={{ background: '#22c55e', color: '#0f172a' }}>
          Dynamic Collections Engine
        </span>
      </header>

      <CollectionsManager initialCollections={collections as any} availableRestaurants={restaurants} />
    </div>
  );
}
