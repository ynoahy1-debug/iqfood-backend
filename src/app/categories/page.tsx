import React from 'react';
import Sidebar from '@/components/Sidebar';
import CategoriesManager from '@/components/CategoriesManager';

export const metadata = {
  title: 'إدارة تصنيفات المطاعم | IQFood Dashboard',
};

export default function CategoriesPage() {
  return (
    <div className="admin-layout flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 bg-slate-50 min-h-screen">
        <CategoriesManager />
      </main>
    </div>
  );
}
