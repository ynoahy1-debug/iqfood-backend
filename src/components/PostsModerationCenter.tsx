'use client';

import React, { useState } from'react';

interface ReviewItem {
 id: string;
 type?:'REVIEW' |'SUGGESTION' |'QUESTION';
 rating: number;
 comment: string;
 image?: string | null;
 status:'PENDING' |'APPROVED' |'REJECTED';
 createdAt: string;
 user: {
 id: string;
 name: string;
 username: string;
 avatar?: string | null;
 };
 restaurant?: {
 id: string;
 name: string;
 category: string;
 city: string;
 } | null;
}

export default function PostsModerationCenter({
 initialReviews,
 initialAutoApprove = false,
}: {
 initialReviews: ReviewItem[];
 initialAutoApprove?: boolean;
}) {
 const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
 const [filter, setFilter] = useState<'ALL' |'PENDING' |'APPROVED' |'REJECTED'>('PENDING');
 const [loadingId, setLoadingId] = useState<string | null>(null);
 const [selectedImage, setSelectedImage] = useState<string | null>(null);
 const [autoApproveAll, setAutoApproveAll] = useState<boolean>(initialAutoApprove);
 const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

 const toggleAutoApproveSettings = async (newValue: boolean) => {
 setIsUpdatingSettings(true);
 try {
 const res = await fetch('/api/settings', {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ autoApproveAllPosts: newValue }),
 });
 const data = await res.json();
 if (res.ok && data.success) {
 setAutoApproveAll(newValue);
 }
 } catch (err) {
 console.error('Failed to update system settings', err);
 } finally {
 setIsUpdatingSettings(false);
 }
 };

 const pendingCount = reviews.filter((r) => r.status ==='PENDING').length;
 const approvedCount = reviews.filter((r) => r.status ==='APPROVED').length;
 const rejectedCount = reviews.filter((r) => r.status ==='REJECTED').length;

 const updateStatus = async (id: string, newStatus:'APPROVED' |'REJECTED') => {
 setLoadingId(id);
 try {
 const res = await fetch(`/api/reviews/${id}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ status: newStatus }),
 });

 if (res.ok) {
 setReviews((prev) =>
 prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
 );
 }
 } catch (err) {
 console.error('Failed to update status', err);
 } finally {
 setLoadingId(null);
 }
 };

 const deleteReview = async (id: string) => {
 if (!confirm('هل أنت تأكد من رغبتك بحذف هذا المنشور نهائياً؟')) return;
 setLoadingId(id);
 try {
 const res = await fetch(`/api/reviews/${id}`, {
 method:'DELETE',
 });

 if (res.ok) {
 setReviews((prev) => prev.filter((r) => r.id !== id));
 }
 } catch (err) {
 console.error('Failed to delete review', err);
 } finally {
 setLoadingId(null);
 }
 };

 const filteredList = reviews.filter((r) => {
 if (filter ==='ALL') return true;
 return r.status === filter;
 });

 return (
 <div>
 {/* Master Control Mode Banner */}
 <div
 style={{
 background: autoApproveAll
 ?'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(15,23,42,0.9) 100%)'
 :'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(15,23,42,0.9) 100%)',
 border: autoApproveAll ?'1px solid #22c55e' :'1px solid #ef4444',
 borderRadius: 20,
 padding: 20,
 marginBottom: 24,
 display:'flex',
 justifyContent:'space-between',
 alignItems:'center',
 flexWrap:'wrap',
 gap: 16,
 }}
 >
 <div>
 <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
 <span style={{ fontSize: 24 }}>{autoApproveAll ?'' :''}</span>
 <h3 style={{ margin: 0, color:'#fff', fontSize: 17, fontWeight:'bold' }}>
 نظام التحكم بالنشر: {autoApproveAll ?'وضع النشر المباشر (تلقائي بدون موافقة)' :'وضع المراجعة المسبقة (تتطلب موافقة الأدمن)'}
 </h3>
 </div>
 <p style={{ margin:'6px 0 0 0', color:'#94a3b8', fontSize: 13 }}>
 {autoApproveAll
 ?' عند تفعيل هذا الوضع: أي منشور جديد يتم إرساله من التطبيق سينشر مباشرة للجميع بدون انتظار إذن الأدمن.'
 :' عند تفعيل هذا الوضع: جميع المنشورات الجديدة تدخل قائمة الانتظار (PENDING) ولن تظهر في التطبيق إلا بعد إجازتها من هذه اللوحة.'}
 </p>
 </div>

 <button
 onClick={() => toggleAutoApproveSettings(!autoApproveAll)}
 disabled={isUpdatingSettings}
 style={{
 background: autoApproveAll ?'#ef4444' :'#22c55e',
 color:'#ffffff',
 border:'none',
 padding:'12px 22px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 14,
 cursor:'pointer',
 boxShadow:'0 4px 14px rgba(0,0,0,0.3)',
 display:'flex',
 alignItems:'center',
 gap: 8,
 }}
 >
 {isUpdatingSettings
 ?'جاري الحفظ...'
 : autoApproveAll
 ?' تفعيل شرط طلب موافقة الأدمن (وضع المراجعة)'
 :' تفعيل النشر المباشر لجميع المنشورات (بدون موافقة)'}
 </button>
 </div>
 {/* Metrics Bar */}
 <div className="stats-grid" style={{ marginBottom: 24 }}>
 <div
 onClick={() => setFilter('PENDING')}
 className="stat-card"
 style={{
 cursor:'pointer',
 border: filter ==='PENDING' ?'2px solid #eab308' :'1px solid #334155',
 }}
 >
 <h3>المعلقة بانتظار الموافقة </h3>
 <div className="val" style={{ color:'#eab308' }}>
 {pendingCount}
 </div>
 </div>
 <div
 onClick={() => setFilter('APPROVED')}
 className="stat-card"
 style={{
 cursor:'pointer',
 border: filter ==='APPROVED' ?'2px solid #22c55e' :'1px solid #334155',
 }}
 >
 <h3>المنشورات المقبولة </h3>
 <div className="val" style={{ color:'#22c55e' }}>
 {approvedCount}
 </div>
 </div>
 <div
 onClick={() => setFilter('REJECTED')}
 className="stat-card"
 style={{
 cursor:'pointer',
 border: filter ==='REJECTED' ?'2px solid #ef4444' :'1px solid #334155',
 }}
 >
 <h3>المنشورات المرفوضة </h3>
 <div className="val" style={{ color:'#ef4444' }}>
 {rejectedCount}
 </div>
 </div>
 <div
 onClick={() => setFilter('ALL')}
 className="stat-card"
 style={{
 cursor:'pointer',
 border: filter ==='ALL' ?'2px solid #ff4757' :'1px solid #334155',
 }}
 >
 <h3>إجمالي المنشورات </h3>
 <div className="val">{reviews.length}</div>
 </div>
 </div>

 {/* Filter Tabs */}
 <div style={{ display:'flex', gap: 10, marginBottom: 20 }}>
 <button
 onClick={() => setFilter('PENDING')}
 style={{
 background: filter ==='PENDING' ?'#eab308' :'#1e293b',
 color: filter ==='PENDING' ?'#0f172a' :'#ffffff',
 border:'none',
 padding:'8px 18px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 }}
 >
 المعلقة ({pendingCount})
 </button>
 <button
 onClick={() => setFilter('APPROVED')}
 style={{
 background: filter ==='APPROVED' ?'#22c55e' :'#1e293b',
 color: filter ==='APPROVED' ?'#ffffff' :'#ffffff',
 border:'none',
 padding:'8px 18px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 }}
 >
 المقبولة ({approvedCount})
 </button>
 <button
 onClick={() => setFilter('REJECTED')}
 style={{
 background: filter ==='REJECTED' ?'#ef4444' :'#1e293b',
 color:'#ffffff',
 border:'none',
 padding:'8px 18px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 }}
 >
 المرفوضة ({rejectedCount})
 </button>
 <button
 onClick={() => setFilter('ALL')}
 style={{
 background: filter ==='ALL' ?'#ff4757' :'#1e293b',
 color:'#ffffff',
 border:'none',
 padding:'8px 18px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 }}
 >
 الكل ({reviews.length})
 </button>
 </div>

 {/* Image Preview Lightbox Dialog */}
 {selectedImage && (
 <div
 onClick={() => setSelectedImage(null)}
 style={{
 position:'fixed',
 inset: 0,
 background:'rgba(0,0,0,0.85)',
 zIndex: 9999,
 display:'flex',
 alignItems:'center',
 justifyContent:'center',
 padding: 20,
 }}
 >
 <div style={{ position:'relative', maxWidth:'90%', maxHeight:'90%' }}>
 <img
 src={selectedImage}
 alt="Food preview"
 style={{ maxWidth:'100%', maxHeight:'80vh', borderRadius: 16, border:'2px solid #ff4757' }}
 />
 <button
 onClick={() => setSelectedImage(null)}
 style={{
 position:'absolute',
 top: -12,
 right: -12,
 background:'#ff4757',
 color:'#ffffff',
 border:'none',
 width: 32,
 height: 32,
 borderRadius:'50%',
 fontWeight:'bold',
 cursor:'pointer',
 }}
 >
 ✕
 </button>
 </div>
 </div>
 )}

 {/* Posts Table */}
 <div className="table-card">
 <h2> قائمة المنشورات ({filteredList.length})</h2>
 {filteredList.length === 0 ? (
 <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8' }}>
 لا توجد منشورات في هذا التصنيف حالياً.
 </div>
 ) : (
 <table>
 <thead>
 <tr>
 <th>نوع المنشور والصورة</th>
 <th>صاحب التقييم</th>
 <th>المطعم / الجهة</th>
 <th>التقييم</th>
 <th>التعليق والانطباع</th>
 <th>حالة المنشور</th>
 <th>التاريخ</th>
 <th>القرارات والتحكم</th>
 </tr>
 </thead>
 <tbody>
 {filteredList.map((rev) => {
 const isSuggestion = rev.type ==='SUGGESTION';
 const isQuestion = rev.type ==='QUESTION';

 return (
 <tr key={rev.id}>
 <td>
 <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
 {rev.image ? (
 <img
 src={rev.image}
 alt="Food"
 onClick={() => setSelectedImage(rev.image!)}
 style={{
 width: 48,
 height: 48,
 borderRadius: 12,
 objectFit:'cover',
 cursor:'pointer',
 border:'1px solid #334155',
 }}
 />
 ) : null}
 {isSuggestion && (
 <span
 style={{
 background:'rgba(56, 189, 248, 0.2)',
 color:'#38bdf8',
 padding:'4px 8px',
 borderRadius: 8,
 fontSize: 11,
 fontWeight:'bold',
 }}
 >
 طلب اقتراح
 </span>
 )}
 {isQuestion && (
 <span
 style={{
 background:'rgba(168, 85, 247, 0.2)',
 color:'#a855f7',
 padding:'4px 8px',
 borderRadius: 8,
 fontSize: 11,
 fontWeight:'bold',
 }}
 >
 سؤال
 </span>
 )}
 {!isSuggestion && !isQuestion && !rev.image && (
 <span style={{ color:'#64748b', fontSize: 12 }}> تقييم مطعم</span>
 )}
 </div>
 </td>
 <td>
 <strong>{rev.user.name}</strong>
 <div style={{ color:'#94a3b8', fontSize: 12 }}>@{rev.user.username}</div>
 </td>
 <td>
 {rev.restaurant ? (
 <>
 <strong>{rev.restaurant.name}</strong>
 <div style={{ color:'#ff6b81', fontSize: 11 }}>{rev.restaurant.category}</div>
 </>
 ) : (
 <span style={{ color:'#38bdf8', fontSize: 12, fontWeight:'bold' }}>
 عام (طلب توصية)
 </span>
 )}
 </td>
 <td style={{ color:'#fbbf24', fontWeight:'bold' }}>
 {!isSuggestion && !isQuestion ?` ${rev.rating}` :'-'}
 </td>
 <td style={{ maxWidth: 260, lineHeight: 1.4 }}>{rev.comment}</td>
 <td>
 {rev.status ==='APPROVED' && (
 <span
 style={{
 background:'rgba(34, 197, 94, 0.2)',
 color:'#4ade80',
 padding:'4px 10px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 12,
 }}
 >
 مقبول ومقيد 
 </span>
 )}
 {rev.status ==='PENDING' && (
 <span
 style={{
 background:'rgba(234, 179, 8, 0.2)',
 color:'#eab308',
 padding:'4px 10px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 12,
 }}
 >
 معلق 
 </span>
 )}
 {rev.status ==='REJECTED' && (
 <span
 style={{
 background:'rgba(239, 68, 68, 0.2)',
 color:'#ef4444',
 padding:'4px 10px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 12,
 }}
 >
 مرفوض 
 </span>
 )}
 </td>
 <td>{new Date(rev.createdAt).toLocaleDateString('ar-IQ')}</td>
 <td>
 <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
 {rev.status !=='APPROVED' && (
 <button
 onClick={() => updateStatus(rev.id,'APPROVED')}
 disabled={loadingId === rev.id}
 style={{
 background:'#22c55e',
 color:'#ffffff',
 border:'none',
 padding:'6px 12px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 موافقة 
 </button>
 )}
 {rev.status !=='REJECTED' && (
 <button
 onClick={() => updateStatus(rev.id,'REJECTED')}
 disabled={loadingId === rev.id}
 style={{
 background:'#eab308',
 color:'#0f172a',
 border:'none',
 padding:'6px 12px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 رفض 
 </button>
 )}
 <button
 onClick={() => deleteReview(rev.id)}
 disabled={loadingId === rev.id}
 style={{
 background:'#ef4444',
 color:'#ffffff',
 border:'none',
 padding:'6px 10px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 حذف 
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 </div>
 );
}
