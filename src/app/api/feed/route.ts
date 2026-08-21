import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const reviews = await prisma.review.findMany({
      where: userId
        ? {
            OR: [
              { status: 'APPROVED' },
              { userId: userId },
            ],
          }
        : {
            status: 'APPROVED',
          },
      include: {
        user: true,
        restaurant: true,
        likes: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedFeed = reviews.map((r) => {
      const isLikedByCurrentUser = userId ? r.likes.some((l) => l.userId === userId) : false;
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
        comments: r.comments.map((c) => ({
          id: c.id,
          userName: c.user.name,
          userAvatar: c.user.avatar,
          text: c.text,
          createdAt: c.createdAt,
        })),
      };
    });

    return NextResponse.json({ success: true, data: formattedFeed });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
