import { prisma } from'@/lib/prisma';
import React from'react';
import UsersManager from'@/components/UsersManager';

export const revalidate = 0;

export default async function UsersPage() {
 const users = await prisma.user.findMany({
 include: {
 reviews: true,
 followers: true,
 following: true,
 },
 orderBy: { createdAt:'desc' },
 });

 const formattedUsers = users.map((u) => ({
 id: u.id,
 name: u.name,
 username: u.username,
 email: u.email,
 avatar: u.avatar,
 bio: u.bio,
 city: (u as any).city || 'بغداد',
 instagram: (u as any).instagram ??'ahmed_iq',
 isSubscribed: (u as any).isSubscribed ?? false,
 postLimit: (u as any).postLimit ?? 5,
 canPostWithoutApproval: (u as any).canPostWithoutApproval ?? false,
 isFrozen: (u as any).isFrozen ?? false,
 reviewCount: u.reviews.length,
 followersCount: u.followers.length,
 followingCount: u.following.length,
 createdAt: u.createdAt,
 }));

 return (
 <div className="dashboard-container">
 <header className="header">
 <div>
 <h1> إدارة المستخدمين (الحذف، التجميد، الإيقاف)</h1>
 <p style={{ color:'#94a3b8', marginTop: 4 }}>
 لوحة مخصصة للتحكم الحصري بالأعضاء، الحظر الفوري، التجميد ، التعديل، والحذف النهائي من الداتابيز 
 </p>
 </div>
 <span className="title-badge" style={{ background:'#a855f7', color:'#ffffff' }}>
 User Control & Freeze Center
 </span>
 </header>

 <UsersManager initialUsers={formattedUsers} />
 </div>
 );
}
