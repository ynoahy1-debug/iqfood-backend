import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';

export const revalidate = 0;

export default async function DashboardOverviewPage() {
  const usersCount = await prisma.user.count();
  const restaurantsCount = await prisma.restaurant.count();
  const reviewsCount = await prisma.review.count({ where: { status: 'APPROVED' } });
  const pendingCount = await prisma.review.count({ where: { status: 'PENDING' } });

  const latestApprovedReviews = await prisma.review.findMany({
    where: { status: 'APPROVED' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      restaurant: true,
    },
  });

  const topRestaurants = await prisma.restaurant.findMany({
    take: 5,
    orderBy: { averageRating: 'desc' },
    include: {
      _count: { select: { reviews: true } },
    },
  });

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>🍔 IQFood Admin Dashboard</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            نظرة عامة على أداء المنصة، السيرفر، والإمارة المركزية لجميع الأقسام
          </p>
        </div>
        <span className="title-badge">v2.0 Modular Dashboard</span>
      </header>

      {/* Main Stats Cards */}
      <div className="stats-grid">
        <Link href="/restaurants" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <h3>إجمالي المطاعم 🏪</h3>
            <div className="val">{restaurantsCount}</div>
            <span style={{ color: '#38bdf8', fontSize: 12 }}>عرض دليل المطاعم ⬅️</span>
          </div>
        </Link>
        <Link href="/users" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <h3>إجمالي المستخدمين 👤</h3>
            <div className="val">{usersCount}</div>
            <span style={{ color: '#a855f7', fontSize: 12 }}>إدارة المستخدمين والكبار ⬅️</span>
          </div>
        </Link>
        <Link href="/posts" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <h3>المنشورات المعلقة ⏳</h3>
            <div className="val" style={{ color: pendingCount > 0 ? '#ef4444' : '#4ade80' }}>
              {pendingCount}
            </div>
            <span style={{ color: '#eab308', fontSize: 12 }}>مراجعة المنشورات المعلقة ⬅️</span>
          </div>
        </Link>
        <Link href="/subscriptions" style={{ textDecoration: 'none' }}>
          <div className="stat-card">
            <h3>التقييمات المعتمدة ⭐</h3>
            <div className="val" style={{ color: '#4ade80' }}>
              {reviewsCount}
            </div>
            <span style={{ color: '#ff4757', fontSize: 12 }}>إدارة الحدود والاشتراكات ⬅️</span>
          </div>
        </Link>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        <Link href="/posts" style={{ textDecoration: 'none' }}>
          <div className="table-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', margin: 0, height: '100%' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📑</div>
            <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 6 }}>مركز مراجعة واعتماد المنشورات</h3>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>
              فحص التقييمات والمعلقة، الموافقة والنشر أو الرفض والحذف المباشر.
            </p>
          </div>
        </Link>

        <Link href="/subscriptions" style={{ textDecoration: 'none' }}>
          <div className="table-card" style={{ border: '1px solid rgba(234, 179, 8, 0.3)', margin: 0, height: '100%' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👑</div>
            <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 6 }}>إدارة الاشتراكات والحدود اليومية</h3>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>
              تعديل الحد اليومي للمنشورات لكل حساب وتفعيل الاشتراكات غير المحدودة VIP.
            </p>
          </div>
        </Link>

        <Link href="/users" style={{ textDecoration: 'none' }}>
          <div className="table-card" style={{ border: '1px solid rgba(168, 85, 247, 0.3)', margin: 0, height: '100%' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
            <h3 style={{ color: '#ffffff', fontSize: 18, marginBottom: 6 }}>إدارة الأعضاء ورابطة كبار المستكشفين</h3>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>
              استعراض ترتيب كبار مستكشفي المطاعم والأوسمة المكتسبة بحساباتهم.
            </p>
          </div>
        </Link>
      </div>

      {/* Overview Recent Approved Reviews */}
      <div className="table-card">
        <h2>📝 أحدث التقييمات المعتمدة بالمنصة</h2>
        <table>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>المطعم</th>
              <th>التقييم</th>
              <th>التعليق والانطباع</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {latestApprovedReviews.map((rev) => (
              <tr key={rev.id}>
                <td>{rev.user.name}</td>
                <td>{rev.restaurant ? rev.restaurant.name : 'طلب اقتراح'}</td>
                <td style={{ color: '#fbbf24', fontWeight: 'bold' }}>⭐ {rev.rating}</td>
                <td>{rev.comment}</td>
                <td>{new Date(rev.createdAt).toLocaleDateString('ar-IQ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Rated Restaurants Overview */}
      <div className="table-card">
        <h2>🔥 أعلى المطاعم تقييماً</h2>
        <table>
          <thead>
            <tr>
              <th>اسم المطعم</th>
              <th>التصنيف</th>
              <th>المدينة</th>
              <th>التقييم</th>
              <th>عدد التقييمات</th>
            </tr>
          </thead>
          <tbody>
            {topRestaurants.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td><span className="badge-cat">{r.category}</span></td>
                <td>{r.city}</td>
                <td style={{ color: '#fbbf24', fontWeight: 'bold' }}>⭐ {r.averageRating}</td>
                <td>{r._count.reviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
