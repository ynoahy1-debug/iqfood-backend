'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  label: string;
  icon: string;
  image?: string;
  order: number;
  restaurantCount?: number;
  createdAt: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: '🍔',
    image: '',
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        setError(data.error || 'تعذر تحميل التصنيفات');
      }
    } catch (err) {
      console.error(err);
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setFormData({
      name: '',
      label: '',
      icon: '🍽️',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      order: categories.length,
    });
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      label: cat.label,
      icon: cat.icon || '🍽️',
      image: cat.image || '',
      order: cat.order || 0,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.label.trim()) {
      alert('يرجى ملء اسم التصنيف والمعرف');
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
        if (data.success) {
          setEditingCategory(null);
          fetchCategories();
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
        if (data.success) {
          setIsCreateOpen(false);
          fetchCategories();
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

  const handleDelete = async (cat: Category) => {
    if (cat.name === 'All') {
      alert('لا يمكن حذف تصنيف (الكل)');
      return;
    }
    if (!confirm(`هل أنت متأكد من رغبتك في حذف تصنيف "${cat.label}"؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || 'تعذر حذف التصنيف');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const commonEmojis = ['🍔', '🍕', '🍣', '☕', '🥩', '🍰', '🌯', '🥗', '🍩', '🍗', '🥪', '🍜', '🍦', '🍹', '🍽️', '🥐', '🧁'];

  const totalRestaurants = categories.reduce((acc, curr) => (curr.name !== 'All' ? acc + (curr.restaurantCount || 0) : acc), 0);

  return (
    <div className="dashboard-container" style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header
        className="header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid #334155',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🏷️</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              إدارة تصنيفات المطاعم (Categories)
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 6, maxWidth: 650, lineHeight: 1.6 }}>
            تحكم بالتصنيفات التي تظهر في شريط الاستكشاف وتطبيق الهاتف بالكامل. يمكنك إضافة تصنيفات جديدة، تعديل أسمائها وأيقوناتها، وترتيب ظهورها للمستخدمين.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
            color: '#fff',
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
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: 16 }}>➕</span>
          <span>إضافة تصنيف جديد</span>
        </button>
      </header>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 18,
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(255, 71, 87, 0.15)',
              color: '#ff4757',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🏷️
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>إجمالي التصنيفات</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{categories.length}</div>
          </div>
        </div>

        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 18,
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🏪
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>إجمالي المطاعم المرتبطة</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>{totalRestaurants}</div>
          </div>
        </div>

        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 18,
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            📱
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>حالة المزامنة مع الموبايل</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8' }}>مباشرة وفورية ⚡</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          style={{
            background: '#1e293b',
            borderRadius: 18,
            padding: 48,
            textAlign: 'center',
            color: '#94a3b8',
            border: '1px solid #334155',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontWeight: 600 }}>جاري تحميل قائمة التصنيفات...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: 16,
            borderRadius: 14,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <button
            onClick={fetchCategories}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 12,
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {!isLoading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {categories.map((cat) => (
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
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              {/* Category Cover */}
              <div style={{ height: 140, position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
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
                      background: 'linear-gradient(135deg, #334155, #1e293b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                    }}
                  >
                    {cat.icon}
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.2) 60%, transparent 100%)',
                  }}
                />

                {/* Emoji & Label */}
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
                      fontSize: 24,
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
                    <span style={{ fontSize: 11, color: '#cbd5e1', fontFamily: 'monospace' }}>Key: {cat.name}</span>
                  </div>
                </div>

                {/* Order Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#f8fafc',
                    fontSize: 11,
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  #{cat.order}
                </div>
              </div>

              {/* Category Footer Body */}
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
                    <span>{cat.restaurantCount ?? 0} مطاعم</span>
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                    {new Date(cat.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #334155' }}>
                  <button
                    onClick={() => openEditModal(cat)}
                    style={{
                      flex: 1,
                      background: '#334155',
                      color: '#f8fafc',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'background 0.2s',
                    }}
                  >
                    <span>✏️</span>
                    <span>تعديل</span>
                  </button>

                  {cat.name !== 'All' && (
                    <button
                      onClick={() => handleDelete(cat)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        padding: '8px 14px',
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
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreateOpen || editingCategory) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
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
              borderRadius: 24,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              border: '1px solid #ff4757',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #334155',
                paddingBottom: 14,
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{editingCategory ? '✏️' : '➕'}</span>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {editingCategory ? `تعديل تصنيف "${editingCategory.label}"` : 'إضافة تصنيف مطاعم جديد'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
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

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Arabic Label */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  عنوان التصنيف بالعربي (يظهر للمستخدمين في التطبيق) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطاعم الشاورما، الأكلات الإيطالية..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Internal Name / Key */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  المعرف الداخلي (Category Key بالإنجليزية) *
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
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    outline: 'none',
                    opacity: editingCategory?.name === 'All' ? 0.5 : 1,
                  }}
                />
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  يُستخدم لربط المطاعم بالتصنيف وفلترة النتائج بدقة في قاعدة البيانات.
                </p>
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  الأيقونة التعبيرية (Emoji) *
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
                      padding: '8px 0',
                      borderRadius: 12,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#ffffff',
                      outline: 'none',
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
                      borderRadius: 12,
                      border: '1px solid #334155',
                      maxHeight: 80,
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
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Banner URL */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  رابط صورة الغلاف (Banner Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Order index */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                  ترتيب الظهور (Order Index)
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 14, borderTop: '1px solid #334155', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCategory(null);
                  }}
                  style={{
                    flex: 1,
                    background: '#334155',
                    color: '#cbd5e1',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 13,
                    boxShadow: '0 4px 15px rgba(255, 71, 87, 0.35)',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingCategory ? '💾 حفظ التعديلات' : '➕ إضافة التصنيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
