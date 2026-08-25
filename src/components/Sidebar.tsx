'use client';

import React from'react';
import Link from'next/link';
import { usePathname, useRouter } from'next/navigation';

export default function Sidebar() {
 const pathname = usePathname();
 const router = useRouter();

 if (pathname ==='/login') {
 return null;
 }

 const navItems = [
 {
 label:'الرئيسية والإحصائيات',
 icon:'',
 href:'/',
 },
 {
 label:'مركز مراجعة المنشورات',
 icon:'',
 href:'/posts',
 badge:'موافقات',
 },
 {
 label:'البلاغات وشكاوى المحتوى',
 icon:'',
 href:'/reports',
 badge:'شكاوى',
 },
 {
 label:'الكلمات البذيئة والنابغة',
 icon:'',
 href:'/profanity',
 badge:'فلتر',
 },
 {
 label:'الحدود والاشتراكات VIP',
 icon:'',
 href:'/subscriptions',
 badge:'VIP',
 },
 {
 label:'دليل ورصيد المطاعم',
 icon:'',
 href:'/restaurants',
 },
 {
 label:'القوائم المخصصة والسلاسل',
 icon:'',
 href:'/collections',
 badge:'جديد',
 },
 {
 label:'المستخدمين وكبار المستكشفين',
 icon:'',
 href:'/users',
 badge:'الترتيب',
 },
 ];

 const handleLogout = async () => {
 try {
 await fetch('/api/admin/logout', { method:'POST' });
 router.push('/login');
 router.refresh();
 } catch (err) {
 console.error('Logout error:', err);
 }
 };

 return (
 <aside className="sidebar">
 <div>
 <div className="sidebar-brand">
 <span className="brand-logo"></span>
 <div>
 <h2 className="brand-title">IQFood</h2>
 <span className="brand-sub">Admin Control Center</span>
 </div>
 </div>

 <div className="sidebar-menu-section">
 <span className="menu-label">قائمة التحكم الرئيسية</span>
 <nav className="sidebar-nav">
 {navItems.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`nav-item ${isActive ?'active' :''}`}
 >
 <span className="nav-icon">{item.icon}</span>
 <span className="nav-text">{item.label}</span>
 {item.badge && <span className="nav-badge">{item.badge}</span>}
 </Link>
 );
 })}
 </nav>
 </div>
 </div>

 <div className="sidebar-footer">
 <button
 onClick={handleLogout}
 style={{
 width:'100%',
 background:'rgba(239, 68, 68, 0.15)',
 color:'#ef4444',
 border:'1px solid rgba(239, 68, 68, 0.4)',
 padding:'10px 14px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 display:'flex',
 alignItems:'center',
 justifyContent:'center',
 gap: 8,
 marginBottom: 16,
 }}
 >
 تسجيل الخروج من الداشبورد
 </button>

 <div className="status-indicator">
 <span className="status-dot"></span>
 <div>
 <div className="status-title">سيرفر مشفر ومحمي </div>
 <div className="status-sub">HttpOnly Session Middleware</div>
 </div>
 </div>
 </div>
 </aside>
 );
}
