export const dynamic ='force-dynamic';

import { NextResponse } from'next/server';
import { prisma } from'@/lib/prisma';

export async function POST(request: Request) {
 try {
 const body = await request.json();
 const { action, email, username, identifier, password, isGoogle, name, avatar, bio, city } = body;

 // ACTION 1: Check Google Account Existence
 if (action ==='check-google' || (isGoogle && !name && !password)) {
 if (!email) {
 return NextResponse.json({ success: false, error:'Email is required' }, { status: 400 });
 }

 const cleanEmail = email.trim().toLowerCase();
 const existingUser = await prisma.user.findUnique({
 where: { email: cleanEmail },
 });

 if (existingUser) {
 if (existingUser.isFrozen) {
 return NextResponse.json(
 { success: false, error:'عذراً، هذا الحساب مجمّد من قبل الإدارة' },
 { status: 403 }
 );
 }
 return NextResponse.json({
 success: true,
 exists: true,
 data: existingUser,
 });
 }

 return NextResponse.json({
 success: true,
 exists: false,
 email: cleanEmail,
 });
 }

 // ACTION 2: Register New User Account
 if (action ==='register' || (name && email && password)) {
 if (!name || !email || !password) {
 return NextResponse.json(
 { success: false, error:'الرجاء إدخال كافة الحقول المطلوبة' },
 { status: 400 }
 );
 }

 const cleanEmail = email.trim().toLowerCase();
 const cleanUsername = (username || cleanEmail.split('@')[0])
 .trim()
 .toLowerCase()
 .replace(/[^a-zA-Z0-9_]/g,'_');

 // Check existing email
 const existingEmail = await prisma.user.findUnique({
 where: { email: cleanEmail },
 });
 if (existingEmail) {
 return NextResponse.json(
 { success: false, error:'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' },
 { status: 400 }
 );
 }

 // Check existing username
 const existingUsername = await prisma.user.findUnique({
 where: { username: cleanUsername },
 });
 if (existingUsername) {
 return NextResponse.json(
 { success: false, error:'اسم المستخدم مستعمل مسبقاً، اختر اسماً آخر' },
 { status: 400 }
 );
 }

 // Create user
 const newUser = await prisma.user.create({
 data: {
 name: name.trim(),
 username: cleanUsername,
 email: cleanEmail,
 password: password,
 avatar: avatar ||'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
 bio: bio ||'عاشق لتجربة الأكل العراقي والمطاعم',
 city: city && typeof city === 'string' && city.trim().length > 0 ? city.trim() : 'بغداد',
 },
 });

 return NextResponse.json({
 success: true,
 message:'تم إنشاء الحساب بنجاح!',
 data: newUser,
 });
 }

 // ACTION 3: Standard Login
 const loginTarget = (identifier || email || username ||'').trim().toLowerCase();

 if (!loginTarget || !password) {
 return NextResponse.json(
 { success: false, error:'يرجى كتابة البريد الإلكتروني أو اسم المستخدم وكلمة المرور' },
 { status: 400 }
 );
 }

 const user = await prisma.user.findFirst({
 where: {
 OR: [
 { email: loginTarget },
 { username: loginTarget },
 ],
 },
 });

 if (!user) {
 return NextResponse.json(
 { success: false, error:'اسم المستخدم أو البريد الإلكتروني غير مسجّل' },
 { status: 404 }
 );
 }

 if (user.password && user.password !== password) {
 return NextResponse.json(
 { success: false, error:'كلمة المرور غير صحيحة، يرجى المحاولة مجدداً' },
 { status: 401 }
 );
 }

 if (user.isFrozen) {
 return NextResponse.json(
 { success: false, error:'عذراً، هذا الحساب مجمّد من قبل الإدارة' },
 { status: 403 }
 );
 }

 return NextResponse.json({
 success: true,
 message:'تم تسجيل الدخول بنجاح!',
 data: user,
 });
 } catch (error) {
 console.error('Error in auth route:', error);
 return NextResponse.json({ success: false, error:'حدث خطأ في السيرفر' }, { status: 500 });
 }
}
