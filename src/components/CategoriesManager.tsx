'use client';

import React, { useState } from 'react';

export interface CategoryItem {
  id: string;
  name: string;
  label: string;
  icon: string;
  image?: string | null;
  order: number;
  restaurantCount?: number;
  createdAt: string;
}

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: '🍔',
    image: '',
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      label: '',
      icon: '🍽️',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      order: categories.length,
    });
    setShowAddModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      label: cat.label,
      icon: cat.icon || '🍽️',
      image: cat.image || '',
      order: cat.order || 0,
    });
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      alert('يرجى ملء عنوان التصنيف والمعرف');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data.data } : c))
          );
          setShowAddModal(false);
          setEditingCategory(null);
        } else {
          alert(data.error || 'تعذر تعديل التصنيف');
        }
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCategories((prev) => [...prev, data.data]);
          setShowAddModal(false);
        } else {
          alert(data.error || 'تعذر إضافة التصنيف');
        }
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (cat.name === 'All') {
      alert('لا يمكن حذف تصنيف (الكل)');
      return;
    }
    if (!confirm(`هل أنت متأكد من رغبتك في حذف تصنيف "${cat.label}"؟`)) {
      return;
    }

    setLoadingId(cat.id);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } else {
        alert(data.error || 'تعذر حذف التصنيف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setLoadingId(null);
    }
  };

  const commonEmojis = ['🍔', '🍕', '🍣', '☕', '🥩', '🍰', '🌯', '🥗', '🍩', '🍗', '🥪', '🍜', '🍦', '🍹', '🍽️', '🥐', '🧁'];

  const totalRestaurants = categories.reduce((acc, curr) => (curr.name !== 'All' ? acc + (curr.restaurantCount || 0) : acc), 0);

  return (
    <div>
      {/* Top Controls & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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
          <span>إضافة تصنيف مطاعم جديد</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            إجمالي التصنيفات: <strong style={{ color: '#fff' }}>{categories.length}</strong>
          </span>
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
            المطاعم المصنفة: <strong style={{ color: '#4ade80' }}>{totalRestaurants}</strong>
          </span>
        </div>
      </div>

      {/* Categories Grid View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {categories.map((cat) => {
          const isDeleting = loadingId === cat.id;

          return (
            <div
              key={cat.id}
              style={{
                background: '#1e293b',
                borderRadius: 20,
                border: '1px solid #334155',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              {/* Category Header Image */}
              <div style={{ height: 140, position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 44,
                    }}
                  >
                    {cat.icon}
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)',
                  }}
                />

                {/* Emoji + Title on top of gradient */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      padding: '6px 10px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {cat.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: 0 }}>{cat.label}</h3>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>Key: {cat.name}</span>
                  </div>
                </div>

                {/* Order Index Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#f8fafc',
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  ترتيب: #{cat.order}
                </div>
              </div>

              {/* Category Body Details */}
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: '#0f172a',
                      padding: '5px 12px',
                      borderRadius: 10,
                      border: '1px solid #334155',
                      color: '#94a3b8',
                    }}
                  >
                    <span>🏪</span>
                    <span>{cat.restaurantCount ?? 0} مطاعم تابعة</span>
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                    {new Date(cat.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #334155' }}>
                  <button
                    onClick={() => openEditModal(cat)}
                    style={{
                      flex: 1,
                      background: '#334155',
                      color: '#f8fafc',
                      border: 'none',
                      padding: '9px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <span>✏️</span>
                    <span>تعديل</span>
                  </button>

                  {cat.name !== 'All' && (
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={isDeleting}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '9px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="حذف التصنيف"
                    >
                      <span>🗑️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
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
              maxWidth: 500,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #ff4757',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #334155',
                paddingBottom: 14,
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ff6b81', margin: 0 }}>
                {editingCategory ? `تعديل تصنيف "${editingCategory.label}"` : 'إضافة تصنيف مطاعم جديد'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* Arabic Label */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>
                  عنوان التصنيف بالعربي (يظهر في التطبيق):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطاعم الشاورما، الأكلات الإيطالية..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Internal Key */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>
                  المعرف الداخلي (Category Key بالإنجليزية):
                </label>
                <input
                  type="text"
                  required
                  disabled={editingCategory?.name === 'All'}
                  placeholder="مثال: Shawarma, Italian, SeaFood..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    opacity: editingCategory?.name === 'All' ? 0.5 : 1,
                  }}
                />
              </div>

              {/* Emoji Icon Picker */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>
                  الأيقونة التعبيرية (Emoji):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="text"
                    required
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    style={{
                      width: 60,
                      textAlign: 'center',
                      fontSize: 22,
                      padding: 8,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      padding: 8,
                      background: '#0f172a',
                      borderRadius: 10,
                      border: '1px solid #334155',
                      maxHeight: 75,
                      overflowY: 'auto',
                    }}
                  >
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        style={{
                          fontSize: 18,
                          padding: '4px 6px',
                          background: formData.icon === emoji ? 'rgba(255, 71, 87, 0.3)' : 'transparent',
                          border: formData.icon === emoji ? '1px solid #ff4757' : 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>
                  رابط صورة الغلاف (Banner Image URL):
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 13,
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              {/* Order Index */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#cbd5e1' }}>
                  ترتيب الظهور (Order Index):
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
                    fontSize: 13,
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#ff4757',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: 13,
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingCategory ? '💾 حفظ التعديلات' : '➕ حفظ وإضافة التصنيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
