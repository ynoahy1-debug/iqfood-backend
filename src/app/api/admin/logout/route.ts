export const dynamic ='force-dynamic';

import { NextResponse } from'next/server';

export async function POST() {
 const response = NextResponse.json({
 success: true,
 message:'تم تسجيل الخروج بنجاح',
 });

 // Clear admin_token cookie
 response.cookies.set('admin_token','', {
 httpOnly: true,
 path:'/',
 maxAge: 0,
 });

 return response;
}
