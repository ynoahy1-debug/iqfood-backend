'use client';

import React, { useState } from'react';

export default function ProfanityManager() {
 const [profanityList, setProfanityList] = useState<string[]>([
'طايح حظ',
'سافل',
'كلب',
'حقير',
'قذر',
'غبي',
'حمار',
'حيوان',
'انعل',
'خرا',
'زفت',
'نصابين',
'كذابين',
'fuck',
'shit',
'bitch',
'scam',
 ]);

 const [newWord, setNewWord] = useState('');
 const [importModalOpen, setImportModalOpen] = useState(false);
 const [importText, setImportText] = useState('');

 const handleAddWord = (e: React.FormEvent) => {
 e.preventDefault();
 const word = newWord.trim();
 if (word && !profanityList.includes(word)) {
 setProfanityList([word, ...profanityList]);
 setNewWord('');
 }
 };

 const handleRemoveWord = (wordToRemove: string) => {
 setProfanityList(profanityList.filter((w) => w !== wordToRemove));
 };

 const handleImportPreset = () => {
 const defaultPreset = [
'طايح الحظ',
'منحط',
'فاشل جذا',
'سرقة',
'احتيال',
'مزين',
'تفه',
'اصابين',
'محتال',
'خداع',
'حرامية',
'شفط',
'عصابة',
'asshole',
'bastard',
 ];

 const updated = Array.from(new Set([...profanityList, ...defaultPreset]));
 setProfanityList(updated);
 alert(' تم استيراد قائمة الكلمات البذيئة الجاهزة وحفظها في الفلتر بنجاح!');
 };

 const handleCustomImport = () => {
 if (!importText.trim()) return;
 const words = importText
 .split(/[\n,]+/)
 .map((w) => w.trim())
 .filter((w) => w.length > 0);

 const updated = Array.from(new Set([...profanityList, ...words]));
 setProfanityList(updated);
 setImportText('');
 setImportModalOpen(false);
 alert(` تم استيراد ${words.length} كلمة جديدة بنجاح إلى الفلتر!`);
 };

 return (
 <div className="table-card" style={{ border:'1px solid rgba(239, 68, 68, 0.4)', marginTop: 24 }}>
 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 12 }}>
 <div>
 <h2> نظام فلترة وحظر الكلمات البذيئة والنابغة (Profanity Control)</h2>
 <p style={{ color:'#94a3b8', fontSize: 13, marginTop: 4 }}>
 المنشورات التي تحتوي على أي من هذه الكلمات سيتم حظرها أو تحويلها لقائمة المعلق تلقائياً
 </p>
 </div>

 <div style={{ display:'flex', gap: 10 }}>
 <button
 onClick={handleImportPreset}
 style={{
 background:'#22c55e',
 color:'#ffffff',
 border:'none',
 padding:'8px 16px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 display:'flex',
 alignItems:'center',
 gap: 6,
 }}
 >
 استيراد القاموس الجاهز (Preset Import)
 </button>
 <button
 onClick={() => setImportModalOpen(true)}
 style={{
 background:'#ff4757',
 color:'#ffffff',
 border:'none',
 padding:'8px 16px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 display:'flex',
 alignItems:'center',
 gap: 6,
 }}
 >
 استيراد قائمة مخصصة (Import List)
 </button>
 </div>
 </div>

 {/* Add Single Word Form */}
 <form onSubmit={handleAddWord} style={{ display:'flex', gap: 10, marginTop: 16, marginBottom: 20 }}>
 <input
 type="text"
 placeholder="اكتب كلمة جديدة لحظرها في المنشورات..."
 value={newWord}
 onChange={(e) => setNewWord(e.target.value)}
 style={{
 flex: 1,
 padding:'10px 14px',
 borderRadius: 12,
 background:'#0f172a',
 border:'1px solid #334155',
 color:'#ffffff',
 }}
 />
 <button
 type="submit"
 style={{
 background:'#ff4757',
 color:'#ffffff',
 border:'none',
 padding:'10px 20px',
 borderRadius: 12,
 fontWeight:'bold',
 fontSize: 13,
 cursor:'pointer',
 }}
 >
 إضافة للقاموس
 </button>
 </form>

 {/* Active Profanity Chips List */}
 <div style={{ display:'flex', flexWrap:'wrap', gap: 8, maxHeight: 180, overflowY:'auto', padding: 8, background:'#0f172a', borderRadius: 14 }}>
 {profanityList.map((word) => (
 <span
 key={word}
 style={{
 background:'rgba(239, 68, 68, 0.15)',
 color:'#ef4444',
 border:'1px solid rgba(239, 68, 68, 0.4)',
 padding:'4px 12px',
 borderRadius: 20,
 fontSize: 12,
 fontWeight:'bold',
 display:'inline-flex',
 alignItems:'center',
 gap: 8,
 }}
 >
 {word}
 <button
 onClick={() => handleRemoveWord(word)}
 style={{
 background:'none',
 border:'none',
 color:'#ef4444',
 cursor:'pointer',
 fontWeight:'bold',
 fontSize: 14,
 lineHeight: 1,
 }}
 >
 ✕
 </button>
 </span>
 ))}
 </div>

 {/* IMPORT CUSTOM LIST MODAL */}
 {importModalOpen && (
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
 maxWidth: 500,
 width:'100%',
 border:'1px solid #ff4757',
 }}
 >
 <h2 style={{ marginBottom: 12 }}> استيراد قائمة كلمات بذيئة مخصصة (Import Profanity List)</h2>
 <p style={{ color:'#94a3b8', fontSize: 13, marginBottom: 14 }}>
 الصق الكلمات التي تريد حظرها مفصولة بـ أسطر جديدة أو فواصل (،):
 </p>
 <textarea
 rows={6}
 placeholder={'كلمة1\nكلمة2\nكلمة3...'}
 value={importText}
 onChange={(e) => setImportText(e.target.value)}
 style={{
 width:'100%',
 padding: 12,
 borderRadius: 12,
 background:'#0f172a',
 border:'1px solid #334155',
 color:'#ffffff',
 marginBottom: 16,
 }}
 />
 <div style={{ display:'flex', gap: 10, justifyContent:'flex-end' }}>
 <button
 onClick={() => setImportModalOpen(false)}
 style={{
 background:'#334155',
 color:'#ffffff',
 border:'none',
 padding:'8px 16px',
 borderRadius: 10,
 cursor:'pointer',
 }}
 >
 إلغاء
 </button>
 <button
 onClick={handleCustomImport}
 style={{
 background:'#22c55e',
 color:'#ffffff',
 border:'none',
 padding:'8px 20px',
 borderRadius: 10,
 fontWeight:'bold',
 cursor:'pointer',
 }}
 >
 تأكيد الاستيراد والحفظ 
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
