import { prisma } from '@/lib/prisma';
import React from 'react';
import ReportsManager from '@/components/ReportsManager';

export const revalidate = 0;

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const formatted = reports.map((r) => ({
    id: r.id,
    reporterId: r.reporterId,
    reviewId: r.reviewId,
    commentId: r.commentId,
    reason: r.reason,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="dashboard-container">
      <header className="header">
        <div>
          <h1>🚩 مركز البلاغات ومكافحة المحتوى المسيء</h1>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>
            متابعة بلاغات وشكاوى المستخدمين، المعاينة الفورية، واتخاذ قرارات الحذف أو التجميد الحازمة
          </p>
        </div>
        <span className="title-badge" style={{ background: '#ef4444', color: '#ffffff' }}>
          Reports & Community Safety
        </span>
      </header>

      <ReportsManager initialReports={formatted} />
    </div>
  );
}
