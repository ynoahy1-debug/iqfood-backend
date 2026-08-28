'use client';

import React, { useState, useEffect } from 'react';

export default function MaintenanceControl() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [title, setTitle] = useState('عذراً، التطبيق قيد الصيانة 🛠️');
  const [message, setMessage] = useState('نعمل حالياً على إجراء تحديثات وصيانة دورية لتحسين تجربتكم. سنعود للعمل قريباً جداً!');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setIsMaintenance(data.data.isMaintenanceMode ?? false);
        if (data.data.maintenanceTitle) setTitle(data.data.maintenanceTitle);
        if (data.data.maintenanceMessage) setMessage(data.data.maintenanceMessage);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleMaintenance = async (newVal: boolean) => {
    try {
      setIsSaving(true);
      setStatusMsg(null);

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMaintenanceMode: newVal,
          maintenanceTitle: title,
          maintenanceMessage: message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsMaintenance(newVal);
        setStatusMsg({
          type: 'success',
          text: newVal
            ? '⚠️ تم تفعيل وضع الصيانة! التطبيق الآن متوقف لجميع المستخدمين.'
            : '✅ تم إيقاف وضع الصيانة! التطبيق يعمل الآن بشكل طبيعي للجميع.',
        });
      } else {
        setStatusMsg({ type: 'error', text: 'فشل حفظ الإعدادات' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'حدث خطأ في الاتصال بالسيرفر' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setStatusMsg(null);

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isMaintenanceMode: isMaintenance,
          maintenanceTitle: title,
          maintenanceMessage: message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'تم حفظ نصوص ورسالة الصيانة بنجاح!' });
      } else {
        setStatusMsg({ type: 'error', text: 'فشل حفظ التعديلات' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'حدث خطأ في الاتصال بالسيرفر' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
        جاري تحميل إعدادات الصيانة...
      </div>
    );
  }

  return (
    <div style={{
      background: isMaintenance ? '#fff5f5' : '#ffffff',
      borderRadius: '20px',
      padding: '24px',
      border: `2px solid ${isMaintenance ? '#ef4444' : '#e2e8f0'}`,
      boxShadow: isMaintenance ? '0 0 20px rgba(239, 68, 68, 0.15)' : '0 4px 16px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease',
      marginBottom: '28px',
    }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: isMaintenance ? '#ef4444' : '#64748b',
            color: '#fff',
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: isMaintenance ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
          }}>
            🛠️
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: isMaintenance ? '#991b1b' : '#0f172a', margin: 0 }}>
              وضع الصيانة وإيقاف التطبيق المؤقت
            </h2>
            <p style={{ color: isMaintenance ? '#b91c1c' : '#64748b', fontSize: '13px', margin: 0, marginTop: '4px' }}>
              {isMaintenance
                ? '🔴 التطبيق متوقف حالياً للمستخدمين وتظهر شاشة الصيانة'
                : '🟢 التطبيق يعمل بشكل طبيعي ومتاح لجميع المستخدمين'}
            </p>
          </div>
        </div>

        {/* Master Toggle Button */}
        <button
          onClick={() => handleToggleMaintenance(!isMaintenance)}
          disabled={isSaving}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            background: isMaintenance ? '#10b981' : '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            border: 'none',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            boxShadow: isMaintenance ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {isSaving ? (
            '⏳ جاري التحديث...'
          ) : isMaintenance ? (
            '✅ إلغاء وضع الصيانة وتشغيل التطبيق الآن'
          ) : (
            '🛑 إيقاف التطبيق وتفعيل وضع الصيانة'
          )}
        </button>
      </div>

      {statusMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '18px',
          fontSize: '13.5px',
          fontWeight: 'bold',
          background: statusMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
          color: statusMsg.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Form & Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
        <form onSubmit={handleSaveText}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
              عنوان رسالة الصيانة في التطبيق
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: عذراً، التطبيق قيد الصيانة 🛠️"
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
              نص وتفاصيل رسالة الصيانة
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب التوضيح الذي سيظهر للمستخدمين عند محاولة فتح التطبيق..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#334155',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 'bold',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            💾 حفظ نصوص الصيانة
          </button>
        </form>

        {/* Live Phone Screen Preview */}
        <div style={{
          background: '#0F172A',
          borderRadius: '18px',
          padding: '24px 16px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px', fontWeight: 'bold' }}>
            📱 معاينة ما يراه المستخدم في التطبيق:
          </div>
          <div style={{
            background: 'rgba(255, 91, 55, 0.15)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 14px auto',
          }}>
            🛠️
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginBottom: '6px' }}>
            {title}
          </div>
          <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '16px', padding: '0 8px' }}>
            {message}
          </div>
          <div style={{
            background: '#FF5B37',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'inline-block',
          }}>
            🔄 إعادة المحاولة
          </div>
        </div>
      </div>
    </div>
  );
}
