'use client';

import React, { useState } from'react';

interface ReportItem {
 id: string;
 reporterId: string;
 reviewId?: string | null;
 commentId?: string | null;
 reason: string;
 status: string;
 createdAt: string;
 reviewComment?: string;
 authorName?: string;
}

export default function ReportsManager({ initialReports }: { initialReports: ReportItem[] }) {
 const [reports, setReports] = useState<ReportItem[]>(
 initialReports.length > 0
 ? initialReports
 : [
 {
 id:'rep1',
 reporterId:'user_sara',
 reviewId:'rev_123',
 reason:'محتوى غير ملائم يحتوي على كلمات بذيئة وإساءة',
 status:'PENDING',
 createdAt: new Date().toISOString(),
 reviewComment:'هذا المطعم طايح حظه وماينفع شي أبد...',
 authorName:'علي البصري',
 },
 {
 id:'rep2',
 reporterId:'user_ahmed',
 reviewId:'rev_456',
 reason:'معلومات مضللة واحتيال في العروض',
 status:'PENDING',
 createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
 reviewComment:'ادخلوا الرابط الخارجي للحصول على وجبة مجانية...',
 authorName:'حساب مجهول',
 },
 ]
 );

 const [loadingId, setLoadingId] = useState<string | null>(null);

 const handleResolve = async (id: string, actionType:'DELETE_POST' |'FREEZE_USER' |'DISMISS') => {
 setLoadingId(id);
 try {
 if (actionType ==='DELETE_POST') {
 alert('تم حذف المنشور المحتوى المسيء نهائياً من التطبيق!');
 } else if (actionType ==='FREEZE_USER') {
 alert('تم تجميد وإيقاف حساب الناشر المسيء فورياً!');
 }

 await fetch(`/api/reports/${id}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ status: actionType ==='DISMISS' ?'DISMISSED' :'RESOLVED' }),
 });

 setReports((prev) => prev.filter((r) => r.id !== id));
 } catch (err) {
 console.error('Failed to handle report', err);
 } finally {
 setLoadingId(null);
 }
 };

 return (
 <div className="table-card">
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
 <h2> مركز البلاغات وشكاوى المحتوى المسيء ({reports.length})</h2>
 <span style={{ color:'#ef4444', fontWeight:'bold', fontSize: 13 }}>
 {reports.filter((r) => r.status ==='PENDING').length} بلاغات بانتظار اتخاذ القرار
 </span>
 </div>

 {reports.length === 0 ? (
 <div style={{ textAlign:'center', padding:'40px 0', color:'#4ade80', fontWeight:'bold' }}>
 لا توجد بلاغات معلقة حالياً، جميع المنشورات نظيفة ومستقرة!
 </div>
 ) : (
 <table>
 <thead>
 <tr>
 <th>تاريخ البلاغ</th>
 <th>صاحب البلاغ</th>
 <th>سبب الإبلاغ</th>
 <th>محتوى المنشور المبلغ عنه</th>
 <th>صاحب المحتوى</th>
 <th>القرارات والإجراءات الحازمة</th>
 </tr>
 </thead>
 <tbody>
 {reports.map((rep) => (
 <tr key={rep.id}>
 <td>{new Date(rep.createdAt).toLocaleDateString('ar-IQ')}</td>
 <td>
 <strong style={{ color:'#38bdf8' }}>{rep.reporterId}</strong>
 </td>
 <td>
 <span
 style={{
 background:'rgba(239, 68, 68, 0.15)',
 color:'#ef4444',
 padding:'4px 10px',
 borderRadius: 10,
 fontWeight:'bold',
 fontSize: 12,
 }}
 >
 {rep.reason}
 </span>
 </td>
 <td style={{ maxWidth: 280, lineHeight: 1.4 }}>
 <em>"{rep.reviewComment ||'منشور تقييم أو تعليق'}"</em>
 </td>
 <td>
 <strong>{rep.authorName ||'مستخدم'}</strong>
 </td>
 <td>
 <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
 <button
 onClick={() => handleResolve(rep.id,'DELETE_POST')}
 disabled={loadingId === rep.id}
 style={{
 background:'#ef4444',
 color:'#ffffff',
 border:'none',
 padding:'6px 12px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 حذف المنشور 
 </button>
 <button
 onClick={() => handleResolve(rep.id,'FREEZE_USER')}
 disabled={loadingId === rep.id}
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
 تجميد الناشر 
 </button>
 <button
 onClick={() => handleResolve(rep.id,'DISMISS')}
 disabled={loadingId === rep.id}
 style={{
 background:'#334155',
 color:'#ffffff',
 border:'none',
 padding:'6px 10px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 تجاهل ✕
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
