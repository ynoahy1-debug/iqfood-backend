import { prisma } from '@/lib/prisma';
import React from 'react';
import CategoriesManager from '@/components/CategoriesManager';

export const revalidate = 0;

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

export default async function CategoriesPage() {
  let categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  if (categories.length === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.create({ data: cat }).catch(() => {});
    }
    categories = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

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

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>🏷️ إدارة تصنيفات المطاعم (Categories)</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            تحكم بالتصنيفات التي تظهر في شريط الاستكشاف وتطبيق الهاتف بالكامل. يمكنك إضافة تصنيفات جديدة، تعديل أسمائها وأيقوناتها، وترتيب ظهورها للمستخدمين.
          </p>
        </div>
        <span className="title-badge" style={{ background: 'linear-gradient(135deg, #ff4757, #ff6b81)' }}>
          Dynamic Categories Engine
        </span>
      </header>

      <CategoriesManager initialCategories={categoriesWithCount as any} />
    </div>
  );
}
