export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const users = await prisma.user.findMany({
      include: {
        reviews: {
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((u) => {
      const todayCount = u.reviews.filter((r) => new Date(r.createdAt) >= startOfToday).length;

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        isSubscribed: u.isSubscribed ?? false,
        postLimit: u.postLimit ?? 5,
        canPostWithoutApproval: (u as any).canPostWithoutApproval ?? false,
        reviewCount: u.reviews.length,
        todayReviewCount: todayCount,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

// Bulk update endpoint for ALL users!
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { isSubscribed, postLimit, canPostWithoutApproval } = body;

    const dataToUpdate: any = {};
    if (typeof isSubscribed === 'boolean') {
      dataToUpdate.isSubscribed = isSubscribed;
    }
    if (typeof postLimit === 'number') {
      dataToUpdate.postLimit = postLimit;
    }
    if (typeof canPostWithoutApproval === 'boolean') {
      dataToUpdate.canPostWithoutApproval = canPostWithoutApproval;
    }

    const result = await prisma.user.updateMany({
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} users`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error in bulk updating users:', error);
    return NextResponse.json({ success: false, error: 'Failed to bulk update users' }, { status: 500 });
  }
}
