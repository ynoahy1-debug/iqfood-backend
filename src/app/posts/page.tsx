import { prisma } from '@/lib/prisma';
import React from 'react';
import PostsModerationCenter from '@/components/PostsModerationCenter';
import Link from 'next/link';

export const revalidate = 0;

export default async function PostsModerationPage() {
  const allReviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      restaurant: true,
    },
  });

  const settings = await prisma.systemSettings.findFirst();
  const autoApproveAllPosts = settings?.autoApproveAllPosts ?? false;

  const formattedReviews = allReviews.map((r) => ({
    id: r.id,
    type: (r as any).type ?? 'REVIEW',
    rating: r.rating,
    comment: r.comment,
    image: r.image,
    status: (r as any).status ?? 'APPROVED',
    createdAt: r.createdAt.toISOString(),
    user: {
      id: r.user.id,
      name: r.user.name,
      username: r.user.username,
      avatar: r.user.avatar,
    },
    restaurant: r.restaurant
      ? {
          id: r.restaurant.id,
          name: r.restaurant.name,
          category: r.restaurant.category,
          city: r.restaurant.city,
        }
      : null,
  }));

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
              ⬅️ العودة للوحة الرئيسية
            </Link>
          </div>
          <h1>📑 مركز مراجعة واعتماد المنشورات</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            مراجعة منشورات الموبايل، الموافقة، الرفض، والتحكم بمود النشر المباشر والموافقة المسبقة ⚙️
          </p>
        </div>
        <span className="title-badge" style={{ background: '#ff4757' }}>
          Posts Moderation Center
        </span>
      </header>

      {/* Posts Moderation Table & Master Switch */}
      <PostsModerationCenter
        initialReviews={formattedReviews as any}
        initialAutoApprove={autoApproveAllPosts}
      />
    </div>
  );
}
