export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    const body = await request.json();
    const { status } = body;

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status: status || 'RESOLVED' },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;
    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 });
  }
}
