import { prisma } from '@/lib/prisma';
import React from 'react';
import UserSubscriptionTable from '@/components/UserSubscriptionTable';

export const revalidate = 0;

export default async function SubscriptionsPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const users = await prisma.user.findMany({
    include: {
      reviews: {
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedUsers = users.map((u) => {
    const todayCount = u.reviews.filter((r) => new Date(r.createdAt) >= startOfToday).length;

    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
      isSubscribed: (u as any).isSubscribed ?? false,
      postLimit: (u as any).postLimit ?? 5,
      canPostWithoutApproval: (u as any).canPostWithoutApproval ?? false,
      reviewCount: u.reviews.length,
      todayReviewCount: todayCount,
    };
  });

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>👑 إدارة الاشتراكات والحدود اليومية</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            لوحة مخصصة للتحكم في الحدود اليومية للمنشورات وتفعيل اشتراكات VIP فردياً وجماعياً
          </p>
        </div>
        <span className="title-badge" style={{ background: '#eab308', color: '#0f172a' }}>
          VIP Subscription Manager
        </span>
      </header>

      <UserSubscriptionTable initialUsers={formattedUsers} />
    </div>
  );
}
