import React from 'react';
import ProfanityManager from '@/components/ProfanityManager';

export const revalidate = 0;

export default function ProfanityPage() {
  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>🛡️ مركز إدارة الكلمات البذيئة والنابغة</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            لوحة مخصصة للتحكم في قاموس الكلمات المحظورة، استيراد القوائم الجاهزة والمخصصة، وحظر المحتوى المسيء تلقائياً
          </p>
        </div>
        <span className="title-badge" style={{ background: '#ef4444', color: '#ffffff' }}>
          Profanity Filter Control
        </span>
      </header>

      <ProfanityManager />
    </div>
  );
}
