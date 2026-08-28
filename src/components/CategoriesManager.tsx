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

  const commonEmojis = ['🍔', '🍕', '🍣', '☕', '🥩', '🍰', '🌯', '🥗', '🍩', '🍗', '🥪', '🍜', '🍦', '🍹', '🍽️'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🏷️</span>
            <h1 className="text-2xl font-bold">إدارة تصنيفات المطاعم (Categories)</h1>
          </div>
          <p className="text-orange-100 text-sm max-w-xl">
            تحكم بالتصنيفات التي تظهر في شريط الاستكشاف وتطبيق الهاتف بالكامل. يمكنك إضافة تصنيفات جديدة، تعديل أسمائها وأيقوناتها، وترتيب ظهورها للمستخدمين.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-5 py-3 rounded-xl shadow transition flex items-center gap-2 shrink-0"
        >
          <span>➕</span>
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 shadow-sm border border-slate-100">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="font-semibold">جاري تحميل التصنيفات...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center justify-between">
          <p>{error}</p>
          <button onClick={fetchCategories} className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
            >
              {/* Category Cover */}
              <div className="h-32 bg-slate-800 relative overflow-hidden">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-4xl">
                    {cat.icon}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Emoji Badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-2xl bg-white/90 backdrop-blur p-1.5 rounded-xl shadow-sm leading-none">
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm">{cat.label}</h3>
                    <span className="text-xs text-white/80 font-mono">Key: {cat.name}</span>
                  </div>
                </div>

                {/* Order Badge */}
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur font-bold border border-white/20">
                  ترتيب: #{cat.order}
                </div>
              </div>

              {/* Category Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span>🏪</span>
                    <span>{cat.restaurantCount ?? 0} مطاعم مرتبطة</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(cat.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="flex-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
                    <span>تعديل</span>
                  </button>

                  {cat.name !== 'All' && (
                    <button
                      onClick={() => handleDelete(cat)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editingCategory ? '✏️' : '➕'}</span>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory ? `تعديل تصنيف "${editingCategory.label}"` : 'إضافة تصنيف مطاعم جديد'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Arabic Label */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان التصنيف بالعربي (يظهر للمستخدمين في التطبيق) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطاعم الشاورما، الأكلات الإيطالية..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Internal Name / Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المعرف الداخلي (Category Key بالإنجليزية) *
                </label>
                <input
                  type="text"
                  required
                  disabled={editingCategory?.name === 'All'}
                  placeholder="مثال: Shawarma, Italian, SeaFood..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none disabled:opacity-50"
                />
                <p className="text-[11px] text-slate-400 mt-1">يُستخدم لربط المطاعم بالتصنيف وفلترة النتائج بدقة.</p>
              </div>

              {/* Emoji Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الأيقونة التعبيرية (Emoji) *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-20 text-center text-2xl bg-slate-50 border border-slate-200 rounded-xl py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <div className="flex-1 flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl max-h-24 overflow-y-auto">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`text-xl p-1 hover:bg-white rounded-lg transition ${
                          formData.icon === emoji ? 'bg-orange-100 ring-2 ring-orange-500' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Banner URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة الغلاف (Banner Image URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                />
              </div>

              {/* Order index */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ترتيب الظهور (Order Index)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl shadow transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>جاري الحفظ...</span>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>{editingCategory ? 'حفظ التعديلات' : 'إضافة التصنيف'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
