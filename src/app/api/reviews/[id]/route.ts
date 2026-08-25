export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const body = await request.json();
    const { status } = body; // APPROVED, REJECTED, PENDING

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { status },
      include: { restaurant: true, user: true },
    });

    // Recalculate average rating of the restaurant
    const approvedReviews = await prisma.review.findMany({
      where: { restaurantId: updatedReview.restaurantId, status: 'APPROVED' },
    });

    const avg =
      approvedReviews.length > 0
        ? parseFloat(
            (approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length).toFixed(1)
          )
        : 0;

    await prisma.restaurant.update({
      where: { id: updatedReview.restaurantId },
      data: { averageRating: avg },
    });

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ success: false, error: 'المنشور غير موجود' }, { status: 404 });
    }

    if (userId && existingReview.userId !== userId) {
      const requester = await prisma.user.findUnique({ where: { id: userId } });
      const owner = await prisma.user.findUnique({ where: { id: existingReview.userId } });
      if (!requester || !owner || (requester.email !== owner.email && requester.username !== owner.username)) {
        return NextResponse.json({ success: false, error: 'غير مصرح لك بحذف هذا المنشور' }, { status: 403 });
      }
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true, message: 'تم حذف المنشور بنجاح' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
