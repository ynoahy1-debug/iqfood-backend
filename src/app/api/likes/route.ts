import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, userId } = body;

    if (!reviewId || !userId) {
      return NextResponse.json(
        { success: false, error: 'reviewId and userId are required' },
        { status: 400 }
      );
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_reviewId: {
            userId,
            reviewId,
          },
        },
      });

      // Remove previous like notification if any
      await prisma.notification.deleteMany({
        where: {
          actorId: userId,
          reviewId: reviewId,
          type: 'LIKE',
        },
      });

      const likeCount = await prisma.like.count({
        where: { reviewId },
      });

      return NextResponse.json({
        success: true,
        isLiked: false,
        likeCount,
      });
    } else {
      await prisma.like.create({
        data: {
          userId,
          reviewId,
        },
      });

      // Find the review owner and create notification if not liking own post
      try {
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
          select: { userId: true },
        });

        if (review && review.userId && review.userId !== userId) {
          await prisma.notification.create({
            data: {
              userId: review.userId,
              actorId: userId,
              reviewId: reviewId,
              type: 'LIKE',
              content: 'أعجب بمنشورك',
            },
          });
        }
      } catch (notifErr) {
        console.error('Error creating like notification:', notifErr);
      }

      const likeCount = await prisma.like.count({
        where: { reviewId },
      });

      return NextResponse.json({
        success: true,
        isLiked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
