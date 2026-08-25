export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, userId, userName, userEmail, userAvatar, text } = body;

    if (!reviewId || !text) {
      return NextResponse.json(
        { success: false, error: 'بيانات التعليق والمعرف مطلوبة' },
        { status: 400 }
      );
    }

    let targetUserId = userId;
    let user = targetUserId ? await prisma.user.findUnique({ where: { id: targetUserId } }) : null;

    if (!user && userEmail) {
      const cleanEmail = userEmail.trim().toLowerCase();
      user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!user && (userName || userEmail)) {
      const cleanEmail = (userEmail || `user_${Date.now()}@iqfood.app`).trim().toLowerCase();
      const cleanUsername = (cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
      
      try {
        user = await prisma.user.create({
          data: {
            name: userName || 'مستخدم IQFood',
            email: cleanEmail,
            username: cleanUsername,
            avatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            bio: 'عاشق لتجربة الأكل العراقي والمطاعم 🍔',
          },
        });
        targetUserId = user.id;
      } catch (err) {
        user = await prisma.user.findFirst();
        targetUserId = user?.id;
      }
    }

    if (!targetUserId) {
      const fallbackUser = await prisma.user.findFirst();
      targetUserId = fallbackUser?.id;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        reviewId: reviewId,
        userId: targetUserId,
        text: text.trim(),
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newComment.id,
        userName: newComment.user.name,
        userAvatar: newComment.user.avatar,
        text: newComment.text,
        createdAt: newComment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حفظ التعليق بالسيرفر' },
      { status: 500 }
    );
  }
}
