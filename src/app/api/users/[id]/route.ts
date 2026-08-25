export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviews: {
          include: { restaurant: true },
          orderBy: { createdAt: 'desc' },
        },
        followers: true,
        following: true,
        savedRestaurants: {
          include: { restaurant: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const reviewCount = user.reviews.length;
    const todayReviewCount = user.reviews.filter((r) => new Date(r.createdAt) >= startOfToday).length;

    const avgRating =
      reviewCount > 0
        ? parseFloat((user.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    const badges = [];
    if (reviewCount >= 5) badges.push({ id: 'beginner', title: '🏆 Beginner', desc: 'قام بتقييم 5 مطاعم' });
    if (reviewCount >= 25) badges.push({ id: 'explorer', title: '🔥 Food Explorer', desc: 'قام بتقييم 25 مطعم' });
    if (reviewCount >= 100) badges.push({ id: 'expert', title: '👑 Food Expert', desc: 'قام بتقييم 100 مطعم' });

    if (badges.length === 0) {
      badges.push({ id: 'starter', title: '🌱 Newbie', desc: 'مستكشف مبتدئ - قيّم 5 مطاعم للحصول على أول وسم!' });
    }

    const favorites = user.savedRestaurants
      .filter((s) => s.type === 'favorite')
      .map((s) => s.restaurant);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        instagram: user.instagram ?? '',
        isSubscribed: user.isSubscribed ?? false,
        postLimit: user.postLimit ?? 5,
        canPostWithoutApproval: (user as any).canPostWithoutApproval ?? false,
        isFrozen: (user as any).isFrozen ?? false,
        reviewCount,
        todayReviewCount,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        averageRating: avgRating,
        badges,
        favorites,
        latestReviews: user.reviews,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { isSubscribed, postLimit, canPostWithoutApproval, isFrozen, instagram, bio, name, username, avatar } = body;

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
    if (typeof isFrozen === 'boolean') {
      dataToUpdate.isFrozen = isFrozen;
    }
    if (typeof instagram === 'string') {
      dataToUpdate.instagram = instagram.trim().replace(/^@+/, '');
    }
    if (typeof bio === 'string') {
      dataToUpdate.bio = bio.trim();
    }
    if (typeof name === 'string') {
      dataToUpdate.name = name.trim();
    }
    if (typeof username === 'string') {
      dataToUpdate.username = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
    }
    if (typeof avatar === 'string') {
      dataToUpdate.avatar = avatar.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
