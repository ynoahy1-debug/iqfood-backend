import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Default Secure Admin Credentials (Can be overridden via ENV vars)
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    if (username === validUsername && password === validPassword) {
      const response = NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح! 🔑',
      });

      // Set Secure HttpOnly Auth Cookie (Prevents XSS & client-side tampering)
      response.cookies.set('admin_token', 'iqfood_admin_secure_token_v1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days valid session
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة ❌' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
