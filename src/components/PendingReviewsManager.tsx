'use client';

import React, { useState } from'react';

interface PendingReview {
 id: string;
 type?: string;
 rating: number;
 comment: string;
 image?: string | null;
 createdAt: string;
 user: {
 name: string;
 username: string;
 avatar?: string | null;
 };
 restaurant?: {
 name: string;
 category: string;
 city: string;
 } | null;
}

export default function PendingReviewsManager({ initialPending }: { initialPending: PendingReview[] }) {
 const [reviews, setReviews] = useState<PendingReview[]>(initialPending);
 const [loadingId, setLoadingId] = useState<string | null>(null);

 const approveReview = async (id: string) => {
 setLoadingId(id);
 try {
 const res = await fetch(`/api/reviews/${id}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ status:'APPROVED' }),
 });

 if (res.ok) {
 setReviews((prev) => prev.filter((r) => r.id !== id));
 }
 } catch (err) {
 console.error('Failed to approve review', err);
 } finally {
 setLoadingId(null);
 }
 };

 const rejectReview = async (id: string) => {
 setLoadingId(id);
 try {
 const res = await fetch(`/api/reviews/${id}`, {
 method:'DELETE',
 });

 if (res.ok) {
 setReviews((prev) => prev.filter((r) => r.id !== id));
 }
 } catch (err) {
 console.error('Failed to reject review', err);
 } finally {
 setLoadingId(null);
 }
 };

 return (
 <div className="table-card" style={{ marginTop: 24, border:'1px solid rgba(251, 191, 36, 0.3)' }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
 <h2> المنشورات المعلقة بانتظار موافقة الأدمن (Pending Approvals)</h2>
 <span
 style={{
 background: reviews.length > 0 ?'#ff4757' :'#334155',
 color:'#ffffff',
 padding:'4px 12px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 13,
 }}
 >
 {reviews.length} بانتظار الموافقة
 </span>
 </div>
 <p style={{ color:'#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 16 }}>
 المنشورات في هذه القائمة لن تظهر في تطبيق الموبايل إلا بعد موافقة الأدمن بالضغط على <strong>[موافقة ونشر ]</strong>.
 </p>

 {reviews.length === 0 ? (
 <div style={{ textAlign:'center', padding:'30px 0', color:'#4ade80', fontWeight:'bold' }}>
 لا توجد منشورات معلقة حالياً، جميع المنشورات تمت مراجعتها!
 </div>
 ) : (
 <table>
 <thead>
 <tr>
 <th>المستخدم</th>
 <th>نوع المنشور / المطعم</th>
 <th>التقييم</th>
 <th>التعليق والانطباع</th>
 <th>التاريخ</th>
 <th>القرار والموافقة</th>
 </tr>
 </thead>
 <tbody>
 {reviews.map((rev) => (
 <tr key={rev.id}>
 <td>
 <strong>{rev.user.name}</strong> (@{rev.user.username})
 </td>
 <td>
 {rev.restaurant ? (
 <>
 <strong>{rev.restaurant.name}</strong> ({rev.restaurant.category})
 </>
 ) : (
 <span style={{ color:'#38bdf8', fontWeight:'bold' }}> طلب اقتراح وتوصية</span>
 )}
 </td>
 <td style={{ color:'#fbbf24', fontWeight:'bold' }}>
 {rev.restaurant ?` ${rev.rating}` :'-'}
 </td>
 <td>{rev.comment}</td>
 <td>{new Date(rev.createdAt).toLocaleDateString('ar-IQ')}</td>
 <td>
 <div style={{ display:'flex', gap: 8 }}>
 <button
 onClick={() => approveReview(rev.id)}
 disabled={loadingId === rev.id}
 style={{
 background:'#22c55e',
 color:'#ffffff',
 border:'none',
 padding:'6px 12px',
 borderRadius: 10,
 fontWeight:'bold',
 cursor:'pointer',
 fontSize: 12,
 }}
 >
 {loadingId === rev.id ?'جاري النشر...' :'موافقة ونشر'}
 </button>
 <button
 onClick={() => rejectReview(rev.id)}
 disabled={loadingId === rev.id}
 style={{
 background:'#ef4444',
 color:'#ffffff',
 border:'none',
 padding:'6px 12px',
 borderRadius: 10,
 fontWeight:'bold',
 cursor:'pointer',
 fontSize: 12,
 }}
 >
 رفض 
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 );
}
