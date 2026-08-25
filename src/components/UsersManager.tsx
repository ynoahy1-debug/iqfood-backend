'use client';

import React, { useState } from'react';

interface UserItem {
 id: string;
 name: string;
 username: string;
 email: string;
 avatar?: string | null;
 bio?: string | null;
 instagram?: string | null;
 isSubscribed: boolean;
 postLimit: number;
 canPostWithoutApproval: boolean;
 isFrozen: boolean;
 reviewCount: number;
}

export default function UsersManager({ initialUsers }: { initialUsers: UserItem[] }) {
 const [users, setUsers] = useState<UserItem[]>(initialUsers);
 const [loadingId, setLoadingId] = useState<string | null>(null);

 const toggleFreezeUser = async (id: string, currentFreeze: boolean) => {
 setLoadingId(id);
 try {
 const res = await fetch(`/api/users/${id}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ isFrozen: !currentFreeze }),
 });

 if (res.ok) {
 setUsers((prev) =>
 prev.map((u) => (u.id === id ? { ...u, isFrozen: !currentFreeze } : u))
 );
 }
 } catch (err) {
 console.error('Failed to toggle freeze', err);
 } finally {
 setLoadingId(null);
 }
 };

 const deleteUser = async (id: string, name: string) => {
 if (!confirm(`هل أنت تأكد من رغبتك بحذف المستخدم"${name}" نهائياً من قاعدة البيانات؟`)) return;
 setLoadingId(id);
 try {
 const res = await fetch(`/api/users/${id}`, {
 method:'DELETE',
 });

 if (res.ok) {
 setUsers((prev) => prev.filter((u) => u.id !== id));
 }
 } catch (err) {
 console.error('Failed to delete user', err);
 } finally {
 setLoadingId(null);
 }
 };

 const toggleVip = async (id: string, currentSub: boolean) => {
 setLoadingId(id);
 try {
 const res = await fetch(`/api/users/${id}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json' },
 body: JSON.stringify({ isSubscribed: !currentSub }),
 });

 if (res.ok) {
 setUsers((prev) =>
 prev.map((u) => (u.id === id ? { ...u, isSubscribed: !currentSub } : u))
 );
 }
 } catch (err) {
 console.error('Failed to update VIP', err);
 } finally {
 setLoadingId(null);
 }
 };

 return (
 <div className="table-card">
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
 <h2> التحكم الشامل بالمستخدمين ({users.length})</h2>
 <span style={{ color:'#94a3b8', fontSize: 13 }}>تجميد، إيقاف، حذف، وتعديل الصلاحيات</span>
 </div>

 <table>
 <thead>
 <tr>
 <th>المستخدم</th>
 <th>اسم المستخدم والإنستغرام</th>
 <th>البريد الإلكتروني</th>
 <th>الزيارات والتقييمات</th>
 <th>حالة الحساب</th>
 <th>نوع الاشتراك</th>
 <th>إجراءات التحكم والقرارات</th>
 </tr>
 </thead>
 <tbody>
 {users.map((u) => (
 <tr key={u.id} style={{ opacity: u.isFrozen ? 0.6 : 1 }}>
 <td>
 <strong>{u.name}</strong>
 </td>
 <td>
 @{u.username} • <span style={{ color:'#e1306c' }}> @{u.instagram || u.username}</span>
 </td>
 <td>{u.email}</td>
 <td>{u.reviewCount} تقييمات</td>
 <td>
 {u.isFrozen ? (
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
 مُجمد وموقوف 
 </span>
 ) : (
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
 نشط وفّعال 
 </span>
 )}
 </td>
 <td>
 <button
 onClick={() => toggleVip(u.id, u.isSubscribed)}
 disabled={loadingId === u.id}
 style={{
 background: u.isSubscribed ?'#eab308' :'#334155',
 color: u.isSubscribed ?'#0f172a' :'#ffffff',
 border:'none',
 padding:'4px 10px',
 borderRadius: 10,
 fontWeight:'bold',
 fontSize: 11,
 cursor:'pointer',
 }}
 >
 {u.isSubscribed ?' VIP غير محدود' :`مجاني (${u.postLimit}/يوم)`}
 </button>
 </td>
 <td>
 <div style={{ display:'flex', gap: 6 }}>
 <button
 onClick={() => toggleFreezeUser(u.id, u.isFrozen)}
 disabled={loadingId === u.id}
 style={{
 background: u.isFrozen ?'#22c55e' :'#38bdf8',
 color:'#ffffff',
 border:'none',
 padding:'6px 12px',
 borderRadius: 8,
 fontWeight:'bold',
 fontSize: 12,
 cursor:'pointer',
 }}
 >
 {u.isFrozen ?'إلغاء التجميد' :'تجميد الحساب'}
 </button>
 <button
 onClick={() => deleteUser(u.id, u.name)}
 disabled={loadingId === u.id}
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
 ))}
 </tbody>
 </table>
 </div>
 );
}
