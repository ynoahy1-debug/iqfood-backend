import './globals.css';
import React from 'react';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'IQFood Admin Dashboard | لوحة تحكم مطاعم العراق',
  description: 'لوحة التحكم المركزية لإدارة المطاعم والتقييمات واشتراكات الموبايل',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
