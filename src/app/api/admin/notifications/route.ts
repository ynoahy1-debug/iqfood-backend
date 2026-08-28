export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/notifications
// Fetch stats and history of sent notifications
export async function GET() {
  try {
    const totalSent = await prisma.notification.count();
    const systemBroadcasts = await prisma.notification.findMany({
      where: {
        type: {
          in: ['BROADCAST', 'SYSTEM', 'ANNOUNCEMENT', 'PROMO'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalUsers = await prisma.user.count();
    const vipUsers = await prisma.user.count({ where: { isSubscribed: true } });

    return NextResponse.json({
      success: true,
      data: systemBroadcasts,
      stats: {
        totalSent,
        totalUsers,
        vipUsers,
        broadcastCount: systemBroadcasts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب سجل الإشعارات' },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications
// Send notification to users (ALL, VIP, SPECIFIC_USER, RESTAURANTS)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      targetAudience = 'ALL', // 'ALL' | 'VIP' | 'SPECIFIC' | 'RESTAURANTS'
      specificUserId,
      specificUserQuery, // email or username
      type = 'BROADCAST',
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'نص الإشعار مطلوب' },
        { status: 400 }
      );
    }

    let targetUserIds: string[] = [];

    if (targetAudience === 'ALL') {
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (targetAudience === 'VIP') {
      const users = await prisma.user.findMany({
        where: { isSubscribed: true },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (targetAudience === 'RESTAURANTS') {
      const users = await prisma.user.findMany({
        where: { isRestaurant: true },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (targetAudience === 'SPECIFIC') {
      if (specificUserId) {
        targetUserIds = [specificUserId];
      } else if (specificUserQuery) {
        const cleanQuery = specificUserQuery.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: cleanQuery },
              { username: cleanQuery },
              { id: cleanQuery },
            ],
          },
          select: { id: true },
        });
        if (user) {
          targetUserIds = [user.id];
        } else {
          return NextResponse.json(
            { success: false, error: 'لم يتم العثور على المستخدم المحدد' },
            { status: 404 }
          );
        }
      }
    }

    if (targetUserIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على مستخدمين لإرسال الإشعار إليهم' },
        { status: 400 }
      );
    }

    // Create notifications for all target users
    const notificationsToCreate = targetUserIds.map((userId) => ({
      userId,
      title: title?.trim() || null,
      content: content.trim(),
      type: type || 'BROADCAST',
      isRead: false,
    }));

    const result = await prisma.notification.createMany({
      data: notificationsToCreate,
    });

    return NextResponse.json({
      success: true,
      sentCount: result.count,
      message: `تم إرسال الإشعار بنجاح إلى ${result.count} مستخدم`,
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إرسال الإشعار' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notifications
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الإشعار مطلوب' },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح',
    });
  } catch (error) {
    console.error('Error deleting admin notification:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف الإشعار' },
      { status: 500 }
    );
  }
}
