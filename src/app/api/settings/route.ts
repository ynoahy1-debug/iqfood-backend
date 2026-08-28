export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'global',
          autoApproveAllPosts: true,
          isMaintenanceMode: false,
          maintenanceTitle: 'عذراً، التطبيق قيد الصيانة 🛠️',
          maintenanceMessage:
            'نعمل حالياً على إجراء تحديثات وصيانة دورية لتحسين تجربتكم. سنعود للعمل قريباً جداً!',
        },
      });
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { autoApproveAllPosts, isMaintenanceMode, maintenanceTitle, maintenanceMessage } = body;

    const updateData: any = {};
    if (typeof autoApproveAllPosts === 'boolean') updateData.autoApproveAllPosts = autoApproveAllPosts;
    if (typeof isMaintenanceMode === 'boolean') updateData.isMaintenanceMode = isMaintenanceMode;
    if (typeof maintenanceTitle === 'string') updateData.maintenanceTitle = maintenanceTitle.trim();
    if (typeof maintenanceMessage === 'string') updateData.maintenanceMessage = maintenanceMessage.trim();

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: updateData,
      create: {
        id: 'global',
        autoApproveAllPosts: autoApproveAllPosts ?? true,
        isMaintenanceMode: isMaintenanceMode ?? false,
        maintenanceTitle: maintenanceTitle ?? 'عذراً، التطبيق قيد الصيانة 🛠️',
        maintenanceMessage:
          maintenanceMessage ??
          'نعمل حالياً على إجراء تحديثات وصيانة دورية لتحسين تجربتكم. سنعود للعمل قريباً جداً!',
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
