'use client';

import React, { useState, useEffect } from 'react';

interface NotificationRecord {
  id: string;
  title: string | null;
  content: string | null;
  type: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
}

interface Stats {
  totalSent: number;
  totalUsers: number;
  vipUsers: number;
  broadcastCount: number;
}

export default function NotificationsManager() {
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    totalUsers: 0,
    vipUsers: 0,
    broadcastCount: 0,
  });
  const [history, setHistory] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'VIP' | 'SPECIFIC' | 'RESTAURANTS'>('ALL');
  const [specificUserQuery, setSpecificUserQuery] = useState('');
  const [notificationType, setNotificationType] = useState('BROADCAST');

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى كتابة نص الإشعار أولاً' });
      return;
    }

    try {
      setIsSending(true);
      setStatusMsg(null);

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          targetAudience,
          specificUserQuery,
          type: notificationType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'تم إرسال الإشعار بنجاح!' });
        setTitle('');
        setContent('');
        setSpecificUserQuery('');
        fetchNotifications();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'فشل إرسال الإشعار' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'حدث خطأ في الاتصال بالسيرفر' });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار من السجل؟')) return;

    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setHistory(history.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF5B37 0%, #FF7A5C 100%)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(255, 91, 55, 0.25)',
          }}>
            🔔
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
              لوحة إرسال الإشعارات والتنبيهات
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0, marginTop: '4px' }}>
              إرسال إشعارات جماعية وفورية لجميع المستخدمين أو فئات محددة في تطبيق IQFood
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>إجمالي المستخدمين في التطبيق</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {stats.totalUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>مستخدمين مسجلين بالقاعدة</div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>المشتركون في VIP</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
            {stats.vipUsers}
          </div>
          <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>أعضاء التميز والنخبة</div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>إجمالي الإشعارات والتفاعلات</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#FF5B37', marginTop: '6px' }}>
            {stats.totalSent}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>إعجابات، تعليقات، وتنبيهات</div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>إشعارات الإدارة المرسلة</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>
            {stats.broadcastCount}
          </div>
          <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>تنبيهات وبث مباشر</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        {/* Send Notification Card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✉️</span> إنشاء وإرسال إشعار جديد
          </h2>

          {statusMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '18px',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: statusMsg.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            }}>
              <span>{statusMsg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSend}>
            {/* Target Audience */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                🎯 الفئة المستهدفة للإشعار
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { id: 'ALL', label: 'جميع المستخدمين (الكل)', icon: '👥', desc: `${stats.totalUsers} مستخدم` },
                  { id: 'VIP', label: 'أعضاء VIP فقط', icon: '⭐', desc: `${stats.vipUsers} مشترك` },
                  { id: 'RESTAURANTS', label: 'حسابات المطاعم', icon: '🏪', desc: 'أصحاب الأنشطة' },
                  { id: 'SPECIFIC', label: 'مستخدم محدد', icon: '👤', desc: 'بالبريد أو المعرف' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setTargetAudience(aud.id as any)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: targetAudience === aud.id ? '2px solid #FF5B37' : '1px solid #e2e8f0',
                      background: targetAudience === aud.id ? '#FFF5F2' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'right',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: targetAudience === aud.id ? '#FF5B37' : '#1e293b' }}>
                      {aud.icon} {aud.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{aud.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specific user query input */}
            {targetAudience === 'SPECIFIC' && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                  بريد المستخدم أو اسم المستخدم (Username/Email)
                </label>
                <input
                  type="text"
                  placeholder="مثال: ahmed@gmail.com أو ahmed_iq"
                  value={specificUserQuery}
                  onChange={(e) => setSpecificUserQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  required
                />
              </div>
            )}

            {/* Notification Type Selector */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>
                🏷️ تصنيف الإشعار
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'BROADCAST', label: '📢 تنبيه عام', color: '#FF5B37' },
                  { id: 'SYSTEM', label: '🚀 تحديث التطبيق', color: '#3b82f6' },
                  { id: 'PROMO', label: '✨ عرض ترويجي', color: '#10b981' },
                  { id: 'ANNOUNCEMENT', label: '⚠️ إعلان هام', color: '#f59e0b' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNotificationType(t.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: notificationType === t.id ? `2px solid ${t.color}` : '1px solid #e2e8f0',
                      background: notificationType === t.id ? '#f1f5f9' : '#fff',
                      color: notificationType === t.id ? t.color : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                عنوان الإشعار (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: خصم خاص اليوم في مطاعم بغداد! 🎉"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Content */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                نص ورسالة الإشعار <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="اكتب نص الإشعار الذي سيظهر لجميع المستخدمين في التطبيق..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF5B37 0%, #FF7A5C 100%)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 'bold',
                border: 'none',
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(255, 91, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSending ? (
                <>⏳ جاري بث وإرسال الإشعار...</>
              ) : (
                <>🚀 إرسال وبث الإشعار الآن</>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview & Info Card */}
        <div>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px' }}>
              📱 معاينة حية لشكل الإشعار في التطبيق
            </h3>

            <div style={{
              background: '#FFF7F5',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #FFE4DE',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}>
              <div style={{
                background: '#FF5B37',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                flexShrink: 0,
              }}>
                🔔
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>
                    {title.trim() ? title : 'إدارة IQFood'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>الآن</div>
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.4' }}>
                  {content.trim() ? content : 'هنا سيظهر نص الإشعار الذي تكتبه في النموذج...'}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255, 91, 55, 0.1)',
                  color: '#FF5B37',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  marginTop: '8px',
                }}>
                  {notificationType === 'VIP' ? 'خاص بـ VIP' : 'إشعار رسمي من الإدارة'}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '20px',
            color: '#fff',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, marginBottom: '8px' }}>
              💡 ميزة البث السحابي
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              يتم حفظ الإشعار في قاعدة البيانات السحابية (Supabase) فوراً، ويظهر للمستخدمين عند فتح التطبيق مع شارة التنبيه في القائمة العلوية.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div style={{
        marginTop: '32px',
        background: '#fff',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            📋 سجل إشعارات وتنبيهات الإدارة السابقة
          </h2>
          <button
            onClick={fetchNotifications}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 تحديث السجل
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            جاري تحميل سجل الإشعارات...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            لم يتم إرسال أي إشعارات إدارية بعد.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#475569' }}>النوع</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#475569' }}>العنوان والمحتوى</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#475569' }}>المستلم</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#475569' }}>تاريخ الإرسال</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#475569' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: item.type === 'VIP' ? '#fef3c7' : '#fee2e2',
                        color: item.type === 'VIP' ? '#92400e' : '#b91c1c',
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '350px' }}>
                      {item.title && (
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>
                          {item.title}
                        </div>
                      )}
                      <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {item.content}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12.5px', color: '#334155' }}>
                      {item.user ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.user.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.user.email}</div>
                        </div>
                      ) : (
                        'عام'
                      )}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>
                      {new Date(item.createdAt).toLocaleString('ar-IQ')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
