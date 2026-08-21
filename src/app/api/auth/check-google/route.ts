import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      if (existingUser.isFrozen) {
        return NextResponse.json(
          { success: false, error: 'عذراً، هذا الحساب مجمّد من قبل الإدارة 🚫' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        exists: true,
        data: existingUser,
      });
    }

    // User does not exist in DB yet -> needs registration
    return NextResponse.json({
      success: true,
      exists: false,
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Error in check-google route:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
