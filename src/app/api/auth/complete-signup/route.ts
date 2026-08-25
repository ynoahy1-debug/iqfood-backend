import { NextResponse } from'next/server';
import { prisma } from'@/lib/prisma';

export const dynamic ='force-dynamic';

export async function POST(request: Request) {
 try {
 const body = await request.json();
 const { name, username, email, password, avatar } = body;

 if (!name || !username || !email || !password) {
 return NextResponse.json(
 { success: false, error:'الرجاء إكمال جميع الحقول المطلوبة' },
 { status: 400 }
 );
 }

 const cleanEmail = email.trim().toLowerCase();
 const cleanUsername = username
 .trim()
 .toLowerCase()
 .replace(/[^a-zA-Z0-9_]/g,'_');

 if (cleanUsername.length < 3) {
 return NextResponse.json(
 { success: false, error:'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' },
 { status: 400 }
 );
 }

 // Check existing email
 const existingEmail = await prisma.user.findUnique({
 where: { email: cleanEmail },
 });
 if (existingEmail) {
 return NextResponse.json(
 { success: false, error:'هذا البريد الإلكتروني مسجّل مسبقاً، تفضل بتسجيل الدخول' },
 { status: 400 }
 );
 }

 // Check existing username
 const existingUsername = await prisma.user.findUnique({
 where: { username: cleanUsername },
 });
 if (existingUsername) {
 return NextResponse.json(
 { success: false, error:'اسم المستخدم (Username) مستعمل مسبقاً، الرجاء اختيار اسم آخر' },
 { status: 400 }
 );
 }

 // Create user in Prisma DB
 const newUser = await prisma.user.create({
 data: {
 name: name.trim(),
 username: cleanUsername,
 email: cleanEmail,
 password: password,
 avatar: avatar && typeof avatar === 'string' && avatar.trim().length > 0 ? avatar.trim() : null,
 bio:'عاشق لتجربة الأكل العراقي والمطاعم',
 },
 });

 return NextResponse.json({
 success: true,
 message:'تم إنشاء الحساب بنجاح!',
 user: {
 id: newUser.id,
 name: newUser.name,
 username: newUser.username,
 email: newUser.email,
 avatar: newUser.avatar,
 bio: newUser.bio,
 instagram: newUser.instagram,
 isSubscribed: newUser.isSubscribed,
 postLimit: newUser.postLimit,
 },
 });
 } catch (error: any) {
 console.error('Error in POST /api/auth/complete-signup:', error);
 return NextResponse.json(
 {
 success: false,
 error:`حدث خطأ في السيرفر أثناء إنشاء الحساب: ${error?.message || error}`,
 },
 { status: 500 }
 );
 }
}
