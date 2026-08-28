import { prisma } from '@/lib/prisma';
import React from 'react';
import AreasManager from '@/components/AreasManager';

export const revalidate = 0;

export const metadata = {
  title: 'إدارة مناطق وأحياء بغداد | IQFood Admin',
};

export default async function AreasPage() {
  let areas = await prisma.area.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { restaurants: true },
      },
    },
  });

  if (areas.length === 0) {
    const DEFAULT_BAGHDAD_AREAS = [
      'الكرادة',
      'المنصور',
      'شارع فلسطين',
      'اليرموك',
      'الجادرية',
      'زيونة',
      'الأعظمية',
      'الكاظمية',
      'الحارثية',
      'العرصات',
      'الغزالية',
      'العامرية',
      'السيدية',
      'الدورة',
      'حي الجامعة',
      'الشعب',
      'البلديات',
      'الغدير',
      'الصالحية',
      'المسبح',
      'القادسية',
      'شارع 14 رمضان',
      'بغداد الجديدة',
    ];

    for (let i = 0; i < DEFAULT_BAGHDAD_AREAS.length; i++) {
      const areaName = DEFAULT_BAGHDAD_AREAS[i];
      await prisma.area.upsert({
        where: { name: areaName },
        update: {},
        create: {
          name: areaName,
          city: 'بغداد',
          order: i,
        },
      });
    }

    areas = await prisma.area.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { restaurants: true },
        },
      },
    });
  }

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>📍 إدارة مناطق وأحياء بغداد (Areas & Regions)</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            تحكم بقائمة المناطق والأحياء المعتمدة في بغداد لتصنيف المطاعم وتفعيل الفلاتر الجغرافية المتقدمة في تطبيق الموبايل!
          </p>
        </div>
        <span className="title-badge" style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}>
          {areas.length} منطقة معتمدة
        </span>
      </header>

      <AreasManager initialAreas={areas as any} />
    </div>
  );
}
