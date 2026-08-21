export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password, avatar, bio } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'الرجاء إدخال كافة الحقول المطلوبة (الاسم، البريد، كلمة المرور)' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || cleanEmail.split('@')[0])
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_]/g, '_');

    // Check existing email
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' },
        { status: 400 }
      );
    }

    // Check existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم مستعمل مسبقاً، اختر اسماً آخر' },
        { status: 400 }
      );
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: password, // Stored for authentication
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: bio || 'عاشق لتجربة الأكل العراقي والمطاعم 🍔',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح! 🚀',
      data: newUser,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ في السيرفر أثناء إنشاء الحساب' }, { status: 500 });
  }
}
