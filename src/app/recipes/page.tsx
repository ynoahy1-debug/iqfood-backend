import React from 'react';
import RecipesManager from '@/components/RecipesManager';

export const revalidate = 0;

export default function RecipesDashboardPage() {
  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>👨‍🍳 لوحة إدارة المحتوى والوصفات المدفوعة</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            إضافة وصفات جديدة للتطبيق، توثيق الشيفات، تحديد الأسعار والاشتراكات ومتابعة المبيعات والأرباح
          </p>
        </div>
        <span className="title-badge" style={{ background: '#9333ea', color: '#ffffff' }}>
          Content & Recipes Control Hub
        </span>
      </header>

      <RecipesManager />
    </div>
  );
}
