import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find existing user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      if (user.isFrozen) {
        return NextResponse.json(
          { success: false, error: 'عذراً، هذا الحساب مجمّد من قبل الإدارة 🚫' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        exists: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          instagram: user.instagram,
          isSubscribed: user.isSubscribed,
          postLimit: user.postLimit,
        },
      });
    }

    // User does not exist in DB yet
    return NextResponse.json({
      success: true,
      exists: false,
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Error in POST /api/auth/google:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في السيرفر أثناء فحص حساب Google' },
      { status: 500 }
    );
  }
}
