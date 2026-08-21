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
          autoApproveAllPosts: false,
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
    const { autoApproveAllPosts } = body;

    if (typeof autoApproveAllPosts !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid value' }, { status: 400 });
    }

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: { autoApproveAllPosts },
      create: {
        id: 'global',
        autoApproveAllPosts,
      },
    });

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
