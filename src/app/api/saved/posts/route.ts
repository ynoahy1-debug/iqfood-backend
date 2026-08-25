export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const savedPosts = await prisma.savedPost.findMany({
      where: { userId },
      include: {
        review: {
          include: {
            user: true,
            restaurant: true,
            likes: true,
            savedPosts: true,
            comments: {
              include: { user: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = savedPosts
      .filter((sp) => sp.review != null)
      .map((sp) => {
        const r = sp.review;
        const isLikedByCurrentUser = r.likes.some((l) => l.userId === userId);
        return {
          id: r.id,
          type: (r as any).type ?? 'REVIEW',
          user: {
            id: r.user.id,
            name: r.user.name,
            username: r.user.username,
            avatar: r.user.avatar,
          },
          restaurant: r.restaurant
            ? {
                id: r.restaurant.id,
                name: r.restaurant.name,
                category: r.restaurant.category,
                city: r.restaurant.city,
                image: r.restaurant.image,
              }
            : null,
          rating: r.rating,
          comment: r.comment,
          image: r.image,
          status: (r as any).status ?? 'APPROVED',
          createdAt: r.createdAt,
          likeCount: r.likes.length,
          isLiked: isLikedByCurrentUser,
          isSaved: true,
          comments: r.comments.map((c) => ({
            id: c.id,
            userName: c.user.name,
            userAvatar: c.user.avatar,
            text: c.text,
            createdAt: c.createdAt,
          })),
        };
      });

    return NextResponse.json({ success: true, data: formattedPosts });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, reviewId, userEmail, userName } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    let validUserId = userId;
    let user = validUserId ? await prisma.user.findUnique({ where: { id: validUserId } }) : null;

    if (!user && userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail.trim().toLowerCase() } });
      if (user) validUserId = user.id;
    }

    if (!user) {
      user = await prisma.user.findFirst();
      if (user) validUserId = user.id;
    }

    if (!validUserId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 });
    }

    // Check if already saved
    const existing = await prisma.savedPost.findUnique({
      where: {
        userId_reviewId: {
          userId: validUserId,
          reviewId,
        },
      },
    });

    if (existing) {
      await prisma.savedPost.delete({
        where: {
          userId_reviewId: {
            userId: validUserId,
            reviewId,
          },
        },
      });
      return NextResponse.json({ success: true, isSaved: false, message: 'Removed from bookmarks' });
    } else {
      await prisma.savedPost.create({
        data: {
          userId: validUserId,
          reviewId,
        },
      });
      return NextResponse.json({ success: true, isSaved: true, message: 'Saved to bookmarks' });
    }
  } catch (error) {
    console.error('Error toggling saved post:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
