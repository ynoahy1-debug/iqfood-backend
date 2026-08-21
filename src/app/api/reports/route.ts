export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reporterId, reviewId, commentId, reason } = body;

    if (!reason) {
      return NextResponse.json({ success: false, error: 'Reason is required' }, { status: 400 });
    }

    const newReport = await prisma.report.create({
      data: {
        reporterId: reporterId || 'anonymous_user',
        reviewId: reviewId || null,
        commentId: commentId || null,
        reason,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم استلام بلاغك بنجاح، سيتم فحص المحتوى من فريق الإدارة 🚩',
      data: newReport,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit report' }, { status: 500 });
  }
}
