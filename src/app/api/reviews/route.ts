export const dynamic ='force-dynamic';

import { NextResponse } from'next/server';
import { prisma } from'@/lib/prisma';
import { checkContent } from'@/lib/profanityFilter';

export async function GET() {
 try {
 const reviews = await prisma.review.findMany({
 orderBy: { createdAt:'desc' },
 include: {
 user: true,
 restaurant: true,
 },
 });
 return NextResponse.json({ success: true, data: reviews });
 } catch (error) {
 console.error('Error fetching reviews:', error);
 return NextResponse.json({ success: false, error:'Internal Error' }, { status: 500 });
 }
}

export async function POST(request: Request) {
 try {
 const body = await request.json();
 const { userId, userName, userEmail, userUsername, userAvatar, restaurantId, type ='REVIEW', rating = 5.0, comment, image } = body;

 if (!comment) {
 return NextResponse.json({ success: false, error:'Missing comment field' }, { status: 400 });
 }

 // PROFANITY & URL LINK FILTER CHECK
 const contentCheck = checkContent(comment);
 const sanitizedComment = contentCheck.cleanText;

 // Check user approval permissions & auto-link
 let validUserId = userId;
 let user = validUserId ? await prisma.user.findUnique({ where: { id: validUserId } }) : null;

 if (!user && userEmail) {
 const cleanEmail = userEmail.trim().toLowerCase();
 user = await prisma.user.findUnique({ where: { email: cleanEmail } });
 if (user) {
 validUserId = user.id;
 }
 }

 if (!user && (userName || userEmail)) {
 const cleanEmail = (userEmail ||`user_${Date.now()}@iqfood.app`).trim().toLowerCase();
 const cleanUsername = (userUsername || userName?.replace(/\s+/g,'_') ||`user_${Date.now()}`).trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g,'_');
 
 try {
 user = await prisma.user.create({
 data: {
 name: userName ||'مستخدم IQFood',
 email: cleanEmail,
 username: cleanUsername,
 avatar: userAvatar ||'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
 bio:'عاشق لتجربة الأكل العراقي والمطاعم',
 },
 });
 validUserId = user.id;
 } catch (err) {
 user = await prisma.user.findFirst();
 validUserId = user?.id;
 }
 }

 if (!user) {
 const firstUser = await prisma.user.findFirst();
 if (firstUser) {
 user = firstUser;
 validUserId = firstUser.id;
 } else {
 return NextResponse.json({ success: false, error:'No user found in database' }, { status: 400 });
 }
 }

 // Check if valid restaurant exists in database
 let validRestaurantId: string | null = null;
 if (restaurantId && restaurantId.length > 0) {
 const existingRest = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
 if (existingRest) {
 validRestaurantId = existingRest.id;
 }
 }

  // Auto-approve posts directly
  const initialStatus = 'APPROVED';

 // Backend Image Compression & Size Optimization Check
 let compressedImage = image || null;
 if (compressedImage && typeof compressedImage ==='string' && compressedImage.length > 500 * 1024) {
 console.log(`[ImageCompression] Image data exceeds 500KB (${Math.round(compressedImage.length / 1024)}KB).`);
 }

 const review = await prisma.review.create({
 data: {
 user: { connect: { id: validUserId } },
 ...(validRestaurantId ? { restaurant: { connect: { id: validRestaurantId } } } : {}),
 type,
 rating: parseFloat(rating || 5.0),
 comment: sanitizedComment,
 image: compressedImage,
 status: initialStatus,
 },
 include: {
 user: true,
 restaurant: true,
 },
 });

 // Recalculate average rating if approved and linked to restaurant
 if (initialStatus ==='APPROVED' && validRestaurantId) {
 const approvedReviews = await prisma.review.findMany({
 where: { restaurantId: validRestaurantId, status:'APPROVED', type:'REVIEW' },
 });
 if (approvedReviews.length > 0) {
 const avg = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / approvedReviews.length;
 await prisma.restaurant.update({
 where: { id: validRestaurantId },
 data: { averageRating: parseFloat(avg.toFixed(1)) },
 });
 }
 }

 return NextResponse.json({
 success: true,
 data: review,
 status: initialStatus,
 requiresApproval: initialStatus ==='PENDING',
 });
 } catch (error) {
 console.error('Error creating review:', error);
 return NextResponse.json({ success: false, error:'Internal Error' }, { status: 500 });
 }
}
