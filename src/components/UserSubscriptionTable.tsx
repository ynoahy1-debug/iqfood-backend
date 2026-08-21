'use client';

import React, { useState } from 'react';

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string | null;
  isSubscribed: boolean;
  postLimit: number;
  canPostWithoutApproval: boolean;
  reviewCount: number;
  todayReviewCount: number;
}

export default function UserSubscriptionTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
  const [globalLimit, setGlobalLimit] = useState<number>(5);

  // Single User Update
  const updateLimitOrSubscription = async (
    userId: string,
    updates: { isSubscribed?: boolean; postLimit?: number; canPostWithoutApproval?: boolean }
  ) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
        );
      }
    } catch (err) {
      console.error('Failed to update user', err);
    } finally {
      setLoadingId(null);
    }
  };

  // Bulk / Global Update for ALL Users
  const handleBulkUpdate = async (updates: { isSubscribed?: boolean; postLimit?: number; canPostWithoutApproval?: boolean }) => {
    setIsBulkLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => ({
            ...u,
            ...updates,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to bulk update users', err);
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <div className="table-card" style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>👑 التحكم بالحد اليومي وموافقات النشر (فردي وجماعي)</h2>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            الجميع يتطلب موافقة الأدمن للنشر ⏳، إلا الحسابات المستثناة المسوح لها بـ <strong>النشر المباشر بدون موافقة ✅</strong>.
          </p>
        </div>
      </div>

      {/* Global Bulk Control Toolbar */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: '16px 20px',
          margin: '16px 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <div>
            <strong style={{ color: '#ffffff', fontSize: 14 }}>التحكم الجماعي بالجميع (Bulk Manager):</strong>
            <div style={{ color: '#94a3b8', fontSize: 12 }}>تطبيق صلاحيات النشر والموافقات والحدود لجميع مستخدمي المنصة</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Global Limit Selector & Apply Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', padding: '6px 12px', borderRadius: 12 }}>
            <span style={{ fontSize: 12, color: '#cbd5e1' }}>الحد الجماعي:</span>
            <select
              value={globalLimit}
              onChange={(e) => setGlobalLimit(parseInt(e.target.value))}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid #475569',
                padding: '4px 8px',
                borderRadius: 8,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <option value={3}>3/يومياً</option>
              <option value={5}>5/يومياً</option>
              <option value={10}>10/يومياً</option>
              <option value={15}>15/يومياً</option>
              <option value={20}>20/يومياً</option>
              <option value={50}>50/يومياً</option>
            </select>
            <button
              onClick={() => handleBulkUpdate({ postLimit: globalLimit })}
              disabled={isBulkLoading}
              style={{
                background: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                padding: '5px 12px',
                borderRadius: 8,
                fontWeight: 'bold',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              تطبيق الحد ⚡
            </button>
          </div>

          {/* Bulk Direct Publishing Exemption Button */}
          <button
            onClick={() => handleBulkUpdate({ canPostWithoutApproval: true })}
            disabled={isBulkLoading}
            style={{
              background: '#22c55e',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontWeight: 'bold',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ✅ تفعيل النشر المباشر للجميع
          </button>

          {/* Bulk Require Admin Approval Button */}
          <button
            onClick={() => handleBulkUpdate({ canPostWithoutApproval: false })}
            disabled={isBulkLoading}
            style={{
              background: '#eab308',
              color: '#0f172a',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 12,
              fontWeight: 'bold',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ⏳ فرض موافقة الأدمن على الجميع
          </button>
        </div>
      </div>

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>البريد الإلكتروني</th>
            <th>منشورات اليوم ⏳</th>
            <th>الحد اليومي</th>
            <th>موافقة الأدمن للنشر</th>
            <th>حالة الاشتراك</th>
            <th>التحكم والترقية</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isTodayLimitReached = !u.isSubscribed && u.todayReviewCount >= u.postLimit;

            return (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong> (@{u.username})
                </td>
                <td>{u.email}</td>
                <td>
                  <span
                    style={{
                      color: isTodayLimitReached ? '#ef4444' : '#4ade80',
                      fontWeight: 'bold',
                    }}
                  >
                    {u.todayReviewCount} منشورات اليوم
                  </span>
                </td>
                <td>
                  {u.isSubscribed ? (
                    <strong style={{ color: '#eab308' }}>غير محدود ♾️</strong>
                  ) : (
                    <span>{u.postLimit} يومياً</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() =>
                      updateLimitOrSubscription(u.id, {
                        canPostWithoutApproval: !u.canPostWithoutApproval,
                      })
                    }
                    disabled={loadingId === u.id}
                    style={{
                      background: u.canPostWithoutApproval ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      color: u.canPostWithoutApproval ? '#4ade80' : '#eab308',
                      border: `1px solid ${u.canPostWithoutApproval ? '#22c55e' : '#eab308'}`,
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontWeight: 'bold',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {u.canPostWithoutApproval ? 'مباشر بدون موافقة ✅' : 'يتطلب موافقة الأدمن ⏳'}
                  </button>
                </td>
                <td>
                  {u.isSubscribed ? (
                    <span
                      style={{
                        background: 'rgba(234, 179, 8, 0.2)',
                        color: '#eab308',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    >
                      👑 مشترك VIP
                    </span>
                  ) : (
                    <span
                      style={{
                        background: 'rgba(148, 163, 184, 0.2)',
                        color: '#94a3b8',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    >
                      مجاني
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() =>
                      updateLimitOrSubscription(u.id, { isSubscribed: !u.isSubscribed })
                    }
                    disabled={loadingId === u.id}
                    style={{
                      background: u.isSubscribed ? '#334155' : '#ff4757',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 10,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: 12,
                      transition: 'all 0.2s',
                    }}
                  >
                    {loadingId === u.id
                      ? 'جاري الحفظ...'
                      : u.isSubscribed
                      ? 'إلغاء VIP'
                      : 'تفعيل VIP ⭐'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
