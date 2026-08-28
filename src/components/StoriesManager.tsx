'use client';

import React, { useState, useEffect } from 'react';

export interface StoryItem {
  id: string;
  restaurantId: string;
  image: string;
  videoUrl?: string | null;
  caption?: string | null;
  durationHours: number;
  expiresAt?: string | null;
  order: number;
  isActive: boolean;
  viewsCount: number;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    image: string;
    category: string;
    city: string;
  };
}

export interface RestaurantSimple {
  id: string;
  name: string;
  category: string;
  city: string;
  image: string;
}

export default function StoriesManager({
  initialStories,
  availableRestaurants,
}: {
  initialStories: StoryItem[];
  availableRestaurants: RestaurantSimple[];
}) {
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    restaurantId: availableRestaurants[0]?.id || '',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
    caption: '',
    durationHours: 24,
    order: 0,
    resetTimer: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingStory(null);
    setFormData({
      restaurantId: availableRestaurants[0]?.id || '',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
      caption: '',
      durationHours: 24,
      order: stories.length,
      resetTimer: false,
    });
    setShowAddModal(true);
  };

  const openEditModal = (story: StoryItem) => {
    setEditingStory(story);
    setFormData({
      restaurantId: story.restaurantId,
      image: story.image,
      caption: story.caption || '',
      durationHours: story.durationHours || 24,
      order: story.order || 0,
      resetTimer: false,
    });
    setShowAddModal(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantId || !formData.image) {
      alert('يرجى اختيار المطعم وصورة الستوري');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingStory) {
        // Update
        const res = await fetch(`/api/stories/${editingStory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: formData.image,
            caption: formData.caption,
            durationHours: Number(formData.durationHours),
            order: Number(formData.order),
            resetTimer: formData.resetTimer,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStories((prev) =>
            prev.map((s) => (s.id === editingStory.id ? { ...s, ...data.data } : s))
          );
          setShowAddModal(false);
          setEditingStory(null);
          alert('تم حفظ تعديلات الستوري بنجاح!');
        } else {
          alert(data.error || 'تعذر تعديل الستوري');
        }
      } else {
        // Create
        const res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: formData.restaurantId,
            image: formData.image,
            caption: formData.caption,
            durationHours: Number(formData.durationHours),
            order: Number(formData.order),
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStories((prev) => [data.data, ...prev]);
          setShowAddModal(false);
          alert('تم نشر الستوري بنجاح ويظهر الآن في شريط الاستكشاف بالتطبيق! 🎉');
        } else {
          alert(data.error || 'تعذر إضافة الستوري');
        }
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActiveStatus = async (id: string, currentActive: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStories((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isActive: !currentActive } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const renewStoryTimer = async (id: string, hours: number) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationHours: hours, resetTimer: true, isActive: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStories((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...data.data } : s))
        );
        alert(`تم تجديد وقت الستوري بنجاح لمدة ${hours} ساعة إضافية!`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (story: StoryItem) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف ستوري "${story.restaurant?.name}" نهائياً؟`)) {
      return;
    }
    setLoadingId(story.id);
    try {
      const res = await fetch(`/api/stories/${story.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStories((prev) => prev.filter((s) => s.id !== story.id));
      } else {
        alert(data.error || 'تعذر حذف الستوري');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const calculateTimeRemaining = (expiresAt?: string | null) => {
    if (!expiresAt) return { isExpired: false, label: 'دائم (غير محدد بوقت)', color: '#38bdf8' };
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { isExpired: true, label: 'منتهي الصلاحية ⏳', color: '#ef4444' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return { isExpired: false, label: `متبقي ${days} يوم و ${remHours} ساعة`, color: '#4ade80' };
    }
    return { isExpired: false, label: `متبقي ${hours} ساعة و ${mins} دقيقة`, color: hours < 4 ? '#fbbf24' : '#4ade80' };
  };

  const totalViews = stories.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
  const activeStoriesCount = stories.filter((s) => s.isActive && (!s.expiresAt || new Date(s.expiresAt).getTime() > Date.now())).length;

  return (
    <div>
      {/* Action Header & Quick Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <button
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 14,
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 15px rgba(255, 71, 87, 0.35)',
          }}
        >
          <span style={{ fontSize: 16 }}>➕</span>
          <span>نشر ستوري جديد لمطعم</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 13,
              color: '#4ade80',
              fontWeight: 600,
            }}
          >
            القصص المعروضة في التطبيق: <strong style={{ color: '#4ade80' }}>{activeStoriesCount}</strong>
          </span>
          <span
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 13,
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            إجمالي المشاهدات: <strong style={{ color: '#fff' }}>👁️ {totalViews}</strong>
          </span>
          <span
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 13,
              color: '#94a3b8',
              fontWeight: 600,
            }}
          >
            إجمالي السجلات: <strong style={{ color: '#fff' }}>{stories.length}</strong>
          </span>
        </div>
      </div>

      {/* Stories Grid Display */}
      {stories.length === 0 ? (
        <div
          style={{
            background: '#1e293b',
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
            color: '#94a3b8',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
          <h3 style={{ color: '#fff', marginBottom: 8 }}>لا توجد أي قصص (Stories) منشورة حالياً</h3>
          <p style={{ fontSize: 13 }}>اضغط على زر "نشر ستوري جديد لمطعم" لاختيار مطعم وتحديد صورة وعرض ومدة الظهور.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {stories.map((story) => {
            const timeInfo = calculateTimeRemaining(story.expiresAt);
            const isDeleting = loadingId === story.id;
            const isStoryActive = story.isActive && !timeInfo.isExpired;

            return (
              <div
                key={story.id}
                style={{
                  background: '#1e293b',
                  borderRadius: 20,
                  border: isStoryActive ? '1px solid #ff4757' : '1px solid #334155',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  opacity: isDeleting ? 0.4 : story.isActive ? 1 : 0.6,
                  transition: 'transform 0.2s',
                }}
              >
                {/* Story Image View */}
                <div style={{ height: 260, position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
                  <img
                    src={story.image}
                    alt={story.restaurant?.name || 'Story'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Gradient Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.2) 50%, rgba(15,23,42,0.85) 100%)',
                    }}
                  />

                  {/* Top Bar on Image: Restaurant Avatar + Name & Order */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      right: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={story.restaurant?.image}
                        alt={story.restaurant?.name}
                        style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', border: '2px solid #ff4757' }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 13, color: '#ffffff' }}>
                          {story.restaurant?.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#cbd5e1' }}>
                          {story.restaurant?.category} • {story.restaurant?.city}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 'bold',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      #{story.order}
                    </span>
                  </div>

                  {/* Bottom of Image: Remaining Time & Views Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      right: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        color: timeInfo.color,
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 'bold',
                        border: `1px solid ${timeInfo.color}40`,
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {timeInfo.label}
                    </span>

                    <span
                      style={{
                        background: 'rgba(56, 189, 248, 0.25)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 'bold',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      👁️ {story.viewsCount} مشاهدة
                    </span>
                  </div>
                </div>

                {/* Story Body & Caption */}
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 2 }}>نص العرض / الكابشن:</label>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#f8fafc',
                        lineHeight: 1.5,
                        margin: 0,
                        maxHeight: 48,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {story.caption || 'بدون نص كابشن'}
                    </p>
                  </div>

                  {/* Actions & Status */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingTop: 8, borderTop: '1px solid #334155' }}>
                    {/* Toggle Active / Pause */}
                    <button
                      onClick={() => toggleActiveStatus(story.id, story.isActive)}
                      style={{
                        flex: 1,
                        background: story.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: story.isActive ? '#4ade80' : '#94a3b8',
                        border: story.isActive ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid #334155',
                        padding: '6px 0',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      title="إيقاف / تفعيل الظهور"
                    >
                      {story.isActive ? 'نشط ✅' : 'موقف ⏸️'}
                    </button>

                    {/* Renew 24h Timer Button */}
                    <button
                      onClick={() => renewStoryTimer(story.id, 24)}
                      style={{
                        flex: 1,
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '6px 0',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      title="إعادة ضبط العداد لـ 24 ساعة جديدة"
                    >
                      🔄 +24h
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(story)}
                      style={{
                        background: '#334155',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      title="تعديل الستوري"
                    >
                      ✏️
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(story)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '6px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      title="حذف الستوري"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Story Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#1e293b',
              padding: 24,
              borderRadius: 20,
              maxWidth: 540,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #ff4757',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, color: '#ff6b81', margin: 0 }}>
                {editingStory ? '✏️ تعديل ستوري المطعم' : '➕ نشر ستوري جديد لمطعم'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Select Restaurant */}
              {!editingStory && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                    اختر المطعم التابع لهذا الستوري: *
                  </label>
                  <select
                    required
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: 14,
                    }}
                  >
                    {availableRestaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category} - {r.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Story Duration / Time Limit */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#fbbf24' }}>
                  ⏱️ مدة بقاء وظهور الستوري قبل الحذف والإخفاء التلقائي:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 8 }}>
                  {[
                    { label: '12 ساعة', value: 12 },
                    { label: '24 ساعة (يوم)', value: 24 },
                    { label: '48 ساعة (يومين)', value: 48 },
                    { label: '72 ساعة (3 أيام)', value: 72 },
                    { label: '7 أيام (أسبوع)', value: 168 },
                  ].map((dur) => (
                    <button
                      key={dur.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, durationHours: dur.value })}
                      style={{
                        background: formData.durationHours === dur.value ? 'linear-gradient(135deg, #ff4757, #ff6b81)' : '#0f172a',
                        color: '#fff',
                        border: formData.durationHours === dur.value ? '1px solid #ff4757' : '1px solid #334155',
                        padding: '8px 6px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>

                {/* Custom Hours Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>أو حدد عدد الساعات يدوياً:</span>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 24 })}
                    style={{
                      width: 90,
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fbbf24',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#fbbf24' }}>ساعة</span>
                </div>

                {editingStory && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer', fontSize: 12, color: '#38bdf8' }}>
                    <input
                      type="checkbox"
                      checked={formData.resetTimer}
                      onChange={(e) => setFormData({ ...formData, resetTimer: e.target.checked })}
                    />
                    <span>إعادة تصفير العداد وبدء مدة جديدة من الآن ⏱️</span>
                  </label>
                )}
              </div>

              {/* Caption & Offer */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                  نص العرض أو تفاصيل الستوري (Caption):
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: خصم خاص 20% على وجبات الغداء اليوم فقط..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 13,
                    resize: 'none',
                  }}
                />
              </div>

              {/* Order index */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                  ترتيب الظهور في شريط الاستكشاف (Order Index):
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 'bold',
                  }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                  صورة الستوري (من جهازك أو رابط مباشر): *
                </label>

                {formData.image && (
                  <div style={{ height: 160, borderRadius: 10, overflow: 'hidden', marginBottom: 8, border: '1px solid #334155' }}>
                    <img src={formData.image} alt="Story Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <label
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px dashed #ff4757',
                    background: '#0f172a',
                    color: '#ff6b81',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                    marginBottom: 8,
                  }}
                >
                  📁 اختيار صورة من جهازك
                  <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: 'none' }} />
                </label>

                <input
                  type="text"
                  placeholder="أو الصق رابط صورة خارجي..."
                  value={formData.image.startsWith('data:') ? '' : formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#334155',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'جاري النشر...' : editingStory ? '💾 حفظ التعديلات' : '📸 نشر الستوري الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
