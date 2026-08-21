'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'فشل تسجيل الدخول، تأكد من البيانات ❌');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء الاتصال بالسيرفر ❌');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#1e293b',
          padding: 36,
          borderRadius: 24,
          maxWidth: 420,
          width: '100%',
          border: '1px solid #ff4757',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 48 }}>🍔</span>
          <h1 style={{ color: '#ffffff', fontSize: 24, marginTop: 12, fontWeight: 'bold' }}>
            IQFood Admin Control Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
            لوحة تحكم مشفرة ومحمية بالكامل بالأذونات الأمنية 🛡️
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '10px 14px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 13,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: 13, marginBottom: 6, fontWeight: 'bold' }}>
              اسم المستخدم (Username):
            </label>
            <input
              type="text"
              required
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 14,
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#ffffff',
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: 13, marginBottom: 6, fontWeight: 'bold' }}>
              كلمة المرور (Password):
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 14,
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#ffffff',
                fontSize: 14,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 14,
              background: '#ff4757',
              color: '#ffffff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 15,
              cursor: isLoading ? 'wait' : 'pointer',
              boxShadow: '0 8px 20px rgba(255, 71, 87, 0.3)',
            }}
          >
            {isLoading ? 'جاري التحقق والتشفير...' : 'تسجيل الدخول للداشبورد 🔑'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
          الحساب الافتراضي: <strong>admin</strong> | كلمة السر: <strong>admin123456</strong>
        </div>
      </div>
    </div>
  );
}
