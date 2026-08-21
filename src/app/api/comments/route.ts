export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, userId, text } = body;

    if (!reviewId || !text) {
      return NextResponse.json(
        { success: false, error: 'بيانات التعليق والمعرف مطلوبة' },
        { status: 400 }
      );
    }

    let targetUserId = userId;
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
