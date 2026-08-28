'use client';

import React, { useState } from 'react';

interface RestaurantItem {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  phone?: string | null;
  workingHours?: string | null;
  averageRating: number;
  viewsCount?: number;
  isFrozen: boolean;
  image: string;
  _count?: { reviews: number };
}

export default function RestaurantsManager({ initialRestaurants }: { initialRestaurants: RestaurantItem[] }) {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(initialRestaurants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string; label: string; icon: string }[]>([]);

  // Edit Restaurant Full Modal State
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Burger',
    city: '',
    address: '',
    phone: '',
    workingHours: '',
    image: '',
    averageRating: 5.0,
  });

  // Edit Rating Quick Modal State
  const [editingRatingItem, setEditingRatingItem] = useState<{ id: string; name: string; rating: number } | null>(null);

  React.useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAvailableCategories(data.data.filter((c: any) => c.name !== 'All'));
        }
      })
      .catch((err) => console.error('Failed to fetch categories', err));
  }, []);

  // New Restaurant Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Burger');
  const [newCity, setNewCity] = useState('بغداد');
  const [newAddress, setNewAddress] = useState('بغداد - المنصور');
  const [newPhone, setNewPhone] = useState('07700000000');
  const [newWorkingHours, setNewWorkingHours] = useState('12:00 م - 12:00 ص');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800');

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
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
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          if (isEdit) {
            setEditForm((prev) => ({ ...prev, image: compressedBase64 }));
          } else {
            setNewImage(compressedBase64);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          category: newCategory,
          city: newCity,
          address: newAddress,
          phone: newPhone,
          workingHours: newWorkingHours,
          image: newImage,
          rating: 5.0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRestaurants([data.data, ...restaurants]);
        setShowAddModal(false);
        setNewName('');
        alert('تمت إضافة وتفعيل المطعم الجديد بنجاح في الدليل والخرائط!');
      }
    } catch (err) {
      console.error('Failed to add restaurant', err);
    }
  };

  const openEditRestaurantModal = (r: RestaurantItem) => {
    setEditingRestaurant(r);
    setEditForm({
      name: r.name,
      category: r.category || 'Burger',
      city: r.city,
      address: r.address,
      phone: r.phone || '',
      workingHours: r.workingHours || '',
      image: r.image,
      averageRating: r.averageRating,
    });
  };

  const handleSaveEditRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant || !editForm.name.trim()) return;

    setLoadingId(editingRestaurant.id);
    try {
      const res = await fetch(`/api/restaurants/${editingRestaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === editingRestaurant.id ? { ...r, ...data.data } : r))
        );
        setEditingRestaurant(null);
        alert(`تم تحديث بيانات وتصنيف مطعم "${editForm.name}" بنجاح! 🎉`);
      } else {
        alert(data.error || 'تعذر تعديل بيانات المطعم');
      }
    } catch (err) {
      console.error('Failed to edit restaurant', err);
      alert('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setLoadingId(null);
    }
  };

  const updateRating = async (id: string, newRating: number) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ averageRating: newRating }),
      });

      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === id ? { ...r, averageRating: newRating } : r))
        );
        setEditingRatingItem(null);
        alert(`تم تحديث تقييم المطعم بنجاح إلى ${newRating}`);
      }
    } catch (err) {
      console.error('Failed to update rating', err);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleFreezeRestaurant = async (id: string, currentFreeze: boolean) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFrozen: !currentFreeze }),
      });

      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isFrozen: !currentFreeze } : r))
        );
      }
    } catch (err) {
      console.error('Failed to freeze restaurant', err);
    } finally {
      setLoadingId(null);
    }
  };

  const deleteRestaurant = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك بحذف المطعم "${name}" نهائياً؟`)) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete restaurant', err);
    } finally {
      setLoadingId(null);
    }
  };

  // Top 10 Rated Active Restaurants
  const top10Restaurants = [...restaurants]
    .filter((r) => !r.isFrozen)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10);

  return (
    <div>
      {/* Top 10 Rated Restaurants Control Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          border: '1px solid #38bdf8',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
              قائمة أعلى 10 مطاعم تقييمًا (تُعرض تلقائيًا في التطبيق)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              يمكنك التحكم في ترتيب المطاعم المعتمدة وتعديل تصنيفها أو تقييم كل مطعم مباشرة ليظهر في قائمة Top 10 بالأعلى!
            </p>
          </div>
          <span style={{ background: '#fbbf24', color: '#0f172a', fontWeight: 'bold', padding: '6px 14px', borderRadius: 12, fontSize: 12 }}>
            Top 10 Manager ⭐
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {top10Restaurants.map((r, index) => (
            <div
              key={r.id}
              style={{
                background: '#0f172a',
                borderRadius: 14,
                padding: 12,
                border: index === 0 ? '1px solid #fbbf24' : '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : '#334155',
                  color: index <= 2 ? '#0f172a' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}
              >
                #{index + 1}
              </div>
              <img src={r.image} alt={r.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 'bold', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: '#fbbf24' }}>⭐ {r.averageRating} • {r.category}</div>
              </div>
              <button
                onClick={() => openEditRestaurantModal(r)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                title="تعديل بيانات وتصنيف المطعم"
              >
                ✏️
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setShowAddModal(true)}
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
          <span>إضافة مطعم جديد للدليل والخرائط</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            إجمالي المشاهدات: <strong style={{ color: '#fff' }}>👁️ {restaurants.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0)}</strong>
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
            إجمالي المطاعم: <strong style={{ color: '#fff' }}>{restaurants.length}</strong>
          </span>
        </div>
      </div>

      {/* Add Restaurant Modal */}
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
              <h2 style={{ fontSize: 18, color: '#ff6b81', margin: 0 }}>➕ إضافة مطعم جديد للدليل</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddRestaurant}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>اسم المطعم:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطعم وكافيه دجلة..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>تصنيف المطعم (Category):</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  >
                    {availableCategories.length > 0 ? (
                      availableCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.icon} {c.label} ({c.name})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Burger">🍔 مطاعم البرغر</option>
                        <option value="Pizza">🍕 مطاعم البيتزا</option>
                        <option value="Sushi">🍣 السوشي والياباني</option>
                        <option value="Coffee">☕ الكافيهات والقهوة</option>
                        <option value="Iraqi">🥩 المشويات والمطابخ العراقية</option>
                        <option value="Desserts">🍰 الحلويات والكريب</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>المدينة:</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>العنوان بالتفصيل:</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>رقم الهاتف:</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>أوقات العمل:</label>
                  <input
                    type="text"
                    value={newWorkingHours}
                    onChange={(e) => setNewWorkingHours(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>صورة غلاف المطعم:</label>
                {newImage && (
                  <div style={{ height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 8, border: '1px solid #334155' }}>
                    <img src={newImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <label
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px dashed #38bdf8',
                    background: '#0f172a',
                    color: '#38bdf8',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                    marginBottom: 8,
                  }}
                >
                  📁 اختيار صورة من جهازك
                  <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, false)} style={{ display: 'none' }} />
                </label>
                <input
                  type="text"
                  placeholder="أو الصق رابط صورة خارجي..."
                  value={newImage.startsWith('data:') ? '' : newImage}
                  onChange={(e) => setNewImage(e.target.value)}
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
                  style={{
                    background: '#ff4757',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  حفظ وإضافة المطعم 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Full Modal (Category, Name, City, Address, Rating, Image) */}
      {editingRestaurant && (
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
              maxWidth: 560,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #38bdf8',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, color: '#38bdf8', margin: 0 }}>✏️ تعديل بيانات وتصنيف المطعم</h2>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>المطعم الحالي: {editingRestaurant.name}</span>
              </div>
              <button onClick={() => setEditingRestaurant(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveEditRestaurant}>
              {/* Name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>اسم المطعم:</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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

              {/* Category & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#fbbf24' }}>
                    🏷️ تصنيف المطعم (Category):
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #fbbf24',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}
                  >
                    {availableCategories.length > 0 ? (
                      availableCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.icon} {c.label} ({c.name})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Burger">🍔 مطاعم البرغر</option>
                        <option value="Pizza">🍕 مطاعم البيتزا</option>
                        <option value="Sushi">🍣 السوشي والياباني</option>
                        <option value="Coffee">☕ الكافيهات والقهوة</option>
                        <option value="Iraqi">🥩 المشويات والمطابخ العراقية</option>
                        <option value="Desserts">🍰 الحلويات والكريب</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>المدينة:</label>
                  <input
                    type="text"
                    required
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              {/* Address */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>العنوان بالتفصيل:</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                  }}
                />
              </div>

              {/* Phone & Working Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>رقم الهاتف:</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>أوقات العمل:</label>
                  <input
                    type="text"
                    value={editForm.workingHours}
                    onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>معدل التقييم (من 1.0 إلى 10.0):</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={editForm.averageRating}
                  onChange={(e) => setEditForm({ ...editForm, averageRating: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fbbf24',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>صورة غلاف المطعم:</label>
                {editForm.image && (
                  <div style={{ height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 8, border: '1px solid #334155' }}>
                    <img src={editForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <label
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px dashed #38bdf8',
                    background: '#0f172a',
                    color: '#38bdf8',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 'bold',
                    marginBottom: 8,
                  }}
                >
                  📁 تغيير الصورة من جهازك
                  <input type="file" accept="image/*" onChange={(e) => handleImageFileChange(e, true)} style={{ display: 'none' }} />
                </label>
                <input
                  type="text"
                  placeholder="أو الصق رابط صورة خارجي..."
                  value={editForm.image.startsWith('data:') ? '' : editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
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
                  onClick={() => setEditingRestaurant(null)}
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
                  disabled={loadingId === editingRestaurant.id}
                  style={{
                    background: '#38bdf8',
                    color: '#0f172a',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: loadingId === editingRestaurant.id ? 0.6 : 1,
                  }}
                >
                  {loadingId === editingRestaurant.id ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rating Quick Modal */}
      {editingRatingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
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
              maxWidth: 400,
              width: '100%',
              border: '1px solid #fbbf24',
            }}
          >
            <h3 style={{ marginBottom: 12, color: '#fbbf24' }}>⭐ تعديل تقييم المطعم: {editingRatingItem.name}</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
              أدخل التقييم الجديد من 1.0 إلى 10.0 لتعديل الترتيب وتحديد موقعه في Top 10:
            </p>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="10.0"
              value={editingRatingItem.rating}
              onChange={(e) =>
                setEditingRatingItem({
                  ...editingRatingItem,
                  rating: parseFloat(e.target.value) || 0,
                })
              }
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 12,
                background: '#0f172a',
                border: '1px solid #fbbf24',
                color: '#fbbf24',
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setEditingRatingItem(null)}
                style={{
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => updateRating(editingRatingItem.id, editingRatingItem.rating)}
                style={{
                  background: '#fbbf24',
                  color: '#0f172a',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: 10,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                حفظ التقييم ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurants Table */}
      <div className="table-card">
        <h2>قائمة المطاعم وحالات التجميد ({restaurants.length})</h2>
        <table>
          <thead>
            <tr>
              <th>صورة المطعم</th>
              <th>اسم المطعم</th>
              <th>التصنيف والمدينة</th>
              <th>العنوان والمنطقة</th>
              <th>معدل التقييم</th>
              <th>المشاهدات 👁️</th>
              <th>حالة المطعم</th>
              <th>إجراءات التحكم والقرارات</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} style={{ opacity: r.isFrozen ? 0.6 : 1 }}>
                <td>
                  <img
                    src={r.image}
                    alt={r.name}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                  />
                </td>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>
                  <span className="badge-cat">{r.category}</span> • {r.city}
                </td>
                <td>{r.address}</td>
                <td>
                  <button
                    onClick={() => setEditingRatingItem({ id: r.id, name: r.name, rating: r.averageRating })}
                    style={{
                      background: 'rgba(255, 184, 0, 0.1)',
                      color: '#fbbf24',
                      border: '1px solid rgba(255, 184, 0, 0.3)',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    ⭐ {r.averageRating}
                  </button>
                </td>
                <td>
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontWeight: 'bold',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    👁️ {r.viewsCount ?? 0}
                  </span>
                </td>
                <td>
                  {r.isFrozen ? (
                    <span
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    >
                      مُجمد وموقوف ❄️
                    </span>
                  ) : (
                    <span
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontWeight: 'bold',
                        fontSize: 12,
                      }}
                    >
                      نشط ومتاح ✅
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEditRestaurantModal(r)}
                      style={{
                        background: '#38bdf8',
                        color: '#0f172a',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontWeight: 'bold',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>✏️</span>
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => toggleFreezeRestaurant(r.id, r.isFrozen)}
                      disabled={loadingId === r.id}
                      style={{
                        background: r.isFrozen ? '#22c55e' : '#64748b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontWeight: 'bold',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {r.isFrozen ? 'إلغاء الإيقاف' : 'تجميد'}
                    </button>
                    <button
                      onClick={() => deleteRestaurant(r.id, r.name)}
                      disabled={loadingId === r.id}
                      style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontWeight: 'bold',
                        fontSize: 12,
                        cursor: 'pointer',
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
    </div>
  );
}
