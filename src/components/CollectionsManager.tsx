'use client';

import React, { useState } from'react';

interface RestaurantSimple {
 id: string;
 name: string;
 category: string;
 city: string;
 averageRating: number;
 image: string;
}

interface CollectionItem {
 id: string;
 title: string;
 description?: string | null;
 emoji: string;
 isPublished: boolean;
 restaurantIds: string;
 createdAt: string;
}

export default function CollectionsManager({
 initialCollections,
 availableRestaurants,
}: {
 initialCollections: CollectionItem[];
 availableRestaurants: RestaurantSimple[];
}) {
 const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
 const [showAddModal, setShowAddModal] = useState(false);
 const [loadingId, setLoadingId] = useState<string | null>(null);

 // Form states
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [emoji, setEmoji] = useState('');
 const [selectedRestIds, setSelectedRestIds] = useState<string[]>([]);

 const handleCreateCollection = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!title.trim()) return;

 try {
 const res = await fetch('/api/collections', {
 method:'POST',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({
 title,
 description,
 emoji,
 restaurantIds: selectedRestIds,
 isPublished: true,
 }),
 });

 const data = await res.json();
 if (res.ok && data.success) {
 setCollections([data.data, ...collections]);
 setShowAddModal(false);
 setTitle('');
 setDescription('');
 setSelectedRestIds([]);
 alert(`تم نشر سلسلة القائمة المخصصة"${title}" بنجاح وتظهر الآن بالكامل في التطبيق!`);
 }
 } catch (err) {
 console.error('Failed to create collection', err);
 }
 };

 const togglePublishStatus = async (id: string, currentStatus: boolean) => {
 setLoadingId(id);
 try {
 const res = await fetch(`/api/collections/${id}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ isPublished: !currentStatus }),
 });

 if (res.ok) {
 setCollections((prev) =>
 prev.map((c) => (c.id === id ? { ...c, isPublished: !currentStatus } : c))
 );
 }
 } catch (err) {
 console.error('Failed to toggle collection publish status', err);
 } finally {
 setLoadingId(null);
 }
 };

 const deleteCollection = async (id: string, titleStr: string) => {
 if (!confirm(`هل أنت تأكد من حذف القائمة المخصصة"${titleStr}"؟`)) return;
 setLoadingId(id);
 try {
 const res = await fetch(`/api/collections/${id}`, {
 method:'DELETE',
 });

 if (res.ok) {
 setCollections((prev) => prev.filter((c) => c.id !== id));
 }
 } catch (err) {
 console.error('Failed to delete collection', err);
 } finally {
 setLoadingId(null);
 }
 };

 const toggleSelectRestaurant = (rId: string) => {
 if (selectedRestIds.includes(rId)) {
 setSelectedRestIds(selectedRestIds.filter((id) => id !== rId));
 } else {
 setSelectedRestIds([...selectedRestIds, rId]);
 }
 };

 return (
 <div>
 {/* Header Actions */}
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
 <button
 onClick={() => setShowAddModal(true)}
 style={{
 background:'#22c55e',
 color:'#0f172a',
 border:'none',
 padding:'12px 24px',
 borderRadius: 14,
 fontWeight:'bold',
 fontSize: 14,
 cursor:'pointer',
 display:'flex',
 alignItems:'center',
 gap: 8,
 }}
 >
 إنشاء سلسلة / قائمة مطاعم مخصصة جديدة
 </button>
 </div>

 {/* Add Collection Modal */}
 {showAddModal && (
 <div
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
 <div
 style={{
 background:'#1e293b',
 padding: 24,
 borderRadius: 20,
 maxWidth: 600,
 width:'100%',
 maxHeight:'90vh',
 overflowY:'auto',
 border:'1px solid #22c55e',
 }}
 >
 <h2 style={{ marginBottom: 16, color:'#4ade80' }}> إنشاء سلسلة قائمة مطاعم مخصصة جديدة</h2>
 <form onSubmit={handleCreateCollection}>
 <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap: 12, marginBottom: 12 }}>
 <div>
 <label style={{ display:'block', fontSize: 13, marginBottom: 4 }}>إيموجي:</label>
 <input
 type="text"
 value={emoji}
 onChange={(e) => setEmoji(e.target.value)}
 style={{
 width:'100%',
 padding: 10,
 borderRadius: 10,
 background:'#0f172a',
 border:'1px solid #334155',
 color:'#fff',
 fontSize: 18,
 textAlign:'center',
 }}
 />
 </div>
 <div>
 <label style={{ display:'block', fontSize: 13, marginBottom: 4 }}>عنوان القائمة المخصصة:</label>
 <input
 type="text"
 required
 placeholder="مثال: أفضل 10 مطاعم أكل صحي"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 style={{
 width:'100%',
 padding: 10,
 borderRadius: 10,
 background:'#0f172a',
 border:'1px solid #334155',
 color:'#fff',
 }}
 />
 </div>
 </div>

 <div style={{ marginBottom: 16 }}>
 <label style={{ display:'block', fontSize: 13, marginBottom: 4 }}>وصف قصير للقائمة:</label>
 <input
 type="text"
 placeholder="مثال: تشكيلة مخصصة لأفضل المطاعم التي تقدم وجبات دايت وصحية"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 style={{
 width:'100%',
 padding: 10,
 borderRadius: 10,
 background:'#0f172a',
 border:'1px solid #334155',
 color:'#fff',
 }}
 />
 </div>

 <div style={{ marginBottom: 16 }}>
 <label style={{ display:'block', fontSize: 13, marginBottom: 8, color:'#4ade80', fontWeight:'bold' }}>
 اختر المطاعم المشمولة في هذه القائمة ({selectedRestIds.length} مطعم محدد):
 </label>

 <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, maxHeight: 220, overflowY:'auto', background:'#0f172a', padding: 12, borderRadius: 12 }}>
 {availableRestaurants.map((r) => {
 const isSelected = selectedRestIds.includes(r.id);
 return (
 <div
 key={r.id}
 onClick={() => toggleSelectRestaurant(r.id)}
 style={{
 padding:'8px 12px',
 borderRadius: 10,
 background: isSelected ?'rgba(74, 222, 128, 0.15)' :'#1e293b',
 border: isSelected ?'1px solid #4ade80' :'1px solid #334155',
 cursor:'pointer',
 display:'flex',
 alignItems:'center',
 gap: 10,
 }}
 >
 <input type="checkbox" checked={isSelected} readOnly />
 <img src={r.image} alt={r.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit:'cover' }} />
 <div style={{ flex: 1, overflow:'hidden' }}>
 <div style={{ fontWeight:'bold', fontSize: 12, color: isSelected ?'#4ade80' :'#fff' }}>{r.name}</div>
 <div style={{ fontSize: 10, color:'#94a3b8' }}>{r.category} • {r.city}</div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
 <button
 type="button"
 onClick={() => setShowAddModal(false)}
 style={{
 background:'#334155',
 color:'#fff',
 border:'none',
 padding:'8px 16px',
 borderRadius: 10,
 cursor:'pointer',
 }}
 >
 إلغاء
 </button>
 <button
 type="submit"
 style={{
 background:'#22c55e',
 color:'#0f172a',
 border:'none',
 padding:'8px 20px',
 borderRadius: 10,
 fontWeight:'bold',
 cursor:'pointer',
 }}
 >
 نشر وتفعيل القائمة 
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Collections List */}
 <div className="table-card">
 <h2> القوائم المخصصة والسلاسل النشطة ({collections.length})</h2>
 {collections.length === 0 ? (
 <div style={{ padding: 40, textAlign:'center', color:'#94a3b8' }}>
 لا توجد قوائم مخصصة منشورة حالياً. اضغط على زر"إنشاء سلسلة / قائمة مطاعم مخصصة جديدة" أعلاه لإنشاء أي قائمة!
 </div>
 ) : (
 <table>
 <thead>
 <tr>
 <th>إيموجي والعنوان</th>
 <th>الوصف والتفاصيل</th>
 <th>عدد المطاعم المشمولة</th>
 <th>حالة النشر والظهور في التطبيق</th>
 <th>إجراءات التحكم</th>
 </tr>
 </thead>
 <tbody>
 {collections.map((c) => {
 let restCount = 0;
 try {
 restCount = JSON.parse(c.restaurantIds ||'[]').length;
 } catch (_) {}

 return (
 <tr key={c.id} style={{ opacity: c.isPublished ? 1 : 0.6 }}>
 <td>
 <strong style={{ fontSize: 15 }}>
 {c.emoji} {c.title}
 </strong>
 </td>
 <td>{c.description ||'بدون وصف'}</td>
 <td style={{ fontWeight:'bold', color:'#38bdf8' }}>{restCount} مطعم</td>
 <td>
 {c.isPublished ? (
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
 منشورة وتظهر في التطبيق 
 </span>
 ) : (
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
 موقوفة ومخفية 
 </span>
 )}
 </td>
 <td>
 <div style={{ display:'flex', gap: 6 }}>
 <button
 onClick={() => togglePublishStatus(c.id, c.isPublished)}
 disabled={loadingId === c.id}
 style={{
 background: c.isPublished ?'#f59e0b' :'#22c55e',
 color:'#ffffff',
 border:'none',
 padding:'6px 12px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 {c.isPublished ?'إيقاف وإخفاء' :'نشر وتفعيل'}
 </button>
 <button
 onClick={() => deleteCollection(c.id, c.title)}
 disabled={loadingId === c.id}
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
