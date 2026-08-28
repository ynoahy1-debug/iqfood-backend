import { prisma } from'@/lib/prisma';
import React from'react';
import RestaurantsManager from'@/components/RestaurantsManager';

export const revalidate = 0;

export default async function RestaurantsPage() {
 const restaurants = await prisma.restaurant.findMany({
 orderBy: { averageRating:'desc' },
 include: {
 _count: { select: { reviews: true } },
 },
 });

 const formatted = restaurants.map((r) => ({
 id: r.id,
 name: r.name,
 category: r.category,
 city: r.city,
 address: r.address,
 phone: r.phone,
 workingHours: r.workingHours,
 averageRating: r.averageRating,
 viewsCount: r.viewsCount ?? 0,
 isFrozen: (r as any).isFrozen ?? false,
 image: r.image,
 _count: r._count,
 }));

 return (
 <div className="dashboard-container">
 <header className="header">
 <div>
 <h1> إدارة المطاعم (إضافة، تعديل، تجميد، حذف)</h1>
 <p style={{ color:'#94a3b8', marginTop: 4 }}>
 لوحة مخصصة لإضافة المطاعم الجديدة، تعديل البيانات، التجميد والإيقاف ، والحذف النهائي من الداتابيز 
 </p>
 </div>
 <span className="title-badge" style={{ background:'#38bdf8', color:'#0f172a' }}>
 Restaurant Control & Freeze Center
 </span>
 </header>

 <RestaurantsManager initialRestaurants={formatted} />
 </div>
 );
}
