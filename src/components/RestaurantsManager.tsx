'use client';

import React, { useState, useEffect } from 'react';

export interface AreaSimple {
  id: string;
  name: string;
  city: string;
}

export interface RestaurantItem {
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
  areaId?: string | null;
  area?: AreaSimple | null;
  features?: string[];
  _count?: { reviews: number };
}

export const ALL_RESTAURANT_FEATURES = [
  { id: 'بوفيه مفتوح', label: '🍽️ بوفيه مفتوح' },
  { id: 'جلسات خارجية', label: '🌿 جلسات / صالة خارجية' },
  { id: 'ألعاب أطفال', label: '🎠 منطقة ألعاب أطفال' },
  { id: 'واي فاي مجاني', label: '📶 واي فاي مجاني' },
  { id: 'وجبات فطور', label: '🍳 وجبات فطور صباحي' },
  { id: 'موقف سيارات', label: '🚗 موقف / بارك سيارات' },
  { id: 'قسم عوائل', label: '👨‍👩‍👧‍👦 مناسب للعائلات (قسم عوائل)' },
  { id: 'خدمة توصيل', label: '🛵 خدمة توصيل متوفرة' },
  { id: 'مناسب للعمل والدراسة', label: '💻 مناسب للعمل والدراسة' },
  { id: 'موسيقى حية', label: '🎶 موسيقى حية / عود' },
  { id: 'غرف خاصة VIP', label: '🚪 غرف خاصة / VIP' },
  { id: 'شيشة وأركيلة', label: '💨 شيشة / أركيلة' },
  { id: 'مناسب لذوي الاحتياجات', label: '♿ مناسب لذوي الاحتياجات الخاصة' },
];

export const IRAQI_GOVERNORATES = [
  'بغداد',
  'أربيل',
  'البصرة',
  'السليمانية',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'نينوى (الموصل)',
  'كركوك',
  'بابل (الحلة)',
  'دهوك',
  'الأنبار (الرمادي/الفلوجة)',
  'صلاح الدين (تكريت/سامراء)',
  'ديالى (بعقوبة)',
  'ذي قار (الناصرية)',
  'ميسان (العمارة)',
  'المثنى (السماوة)',
  'القادسية (الديوانية)',
  'واسط (الكوت)',
];

export default function RestaurantsManager({
  initialRestaurants,
  availableAreas = [],
}: {
  initialRestaurants: RestaurantItem[];
  availableAreas?: AreaSimple[];
}) {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(initialRestaurants);
  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; name: string }[]>([]);
  const [areasList, setAreasList] = useState<AreaSimple[]>(availableAreas);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('برغر');
  const [city, setCity] = useState('بغداد');
  const [customCity, setCustomCity] = useState('');
  const [areaId, setAreaId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('0770 123 4567');
  const [workingHours, setWorkingHours] = useState('12:00 م - 12:00 ص');
  const [rating, setRating] = useState(4.8);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1550547660-d9450f859349?w=800');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDynamicCategories(data.data);
          if (!category) {
            setCategory(data.data[0].name);
          }
        }
      })
      .catch(() => {});

    fetch('/api/areas')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAreasList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditingRestaurant(null);
    setName('');
    setCategory(dynamicCategories[0]?.name || 'برغر');
    setCity('بغداد');
    setCustomCity('');
    setAreaId('');
    setAddress('');
    setPhone('0770 123 4567');
    setWorkingHours('12:00 م - 12:00 ص');
    setRating(4.8);
    setImage('https://images.unsplash.com/photo-1550547660-d9450f859349?w=800');
    setSelectedFeatures(['واي فاي مجاني', 'قسم عوائل']);
    setShowAddModal(true);
  };

  const openEditModal = (r: RestaurantItem) => {
    setEditingRestaurant(r);
    setName(r.name);
    setCategory(r.category);
    if (IRAQI_GOVERNORATES.includes(r.city)) {
      setCity(r.city);
      setCustomCity('');
    } else {
      setCity('أخرى');
      setCustomCity(r.city || '');
    }
    setAreaId(r.areaId || (r.area?.id) || '');
    setAddress(r.address || '');
    setPhone(r.phone || '0770 123 4567');
    setWorkingHours(r.workingHours || '12:00 م - 12:00 ص');
    setRating(r.averageRating || 4.8);
    setImage(r.image || '');
    setSelectedFeatures(Array.isArray(r.features) ? r.features : []);
    setShowAddModal(true);
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((f) => f !== featureId) : [...prev, featureId]
    );
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
        const MAX_HEIGHT = 900;
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
          setImage(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى كتابة اسم المطعم');
      return;
    }

    const finalCity = city === 'أخرى' ? (customCity.trim() || 'أخرى') : city;

    try {
      setIsSubmitting(true);
      if (editingRestaurant) {
        // Update
        const res = await fetch(`/api/restaurants/${editingRestaurant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            category: category.trim(),
            city: finalCity,
            areaId: areaId || null,
            address: address.trim(),
            phone: phone.trim(),
            workingHours: workingHours.trim(),
            averageRating: parseFloat(rating as any) || 4.5,
            image,
            features: selectedFeatures,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setRestaurants((prev) =>
            prev.map((r) => (r.id === editingRestaurant.id ? { ...r, ...data.data } : r))
          );
          setShowAddModal(false);
          setEditingRestaurant(null);
          alert('تم حفظ وتحديث بيانات المطعم بنجاح!');
        } else {
          alert(data.error || 'تعذر تعديل المطعم');
        }
      } else {
        // Create
        const res = await fetch('/api/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            category: category.trim(),
            city: finalCity,
            areaId: areaId || null,
            address: address.trim(),
            phone: phone.trim(),
            workingHours: workingHours.trim(),
            image,
            features: selectedFeatures,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setRestaurants((prev) => [data.data, ...prev]);
          setShowAddModal(false);
          alert('تمت إضافة المطعم بنجاح إلى التطبيق! 🎉');
        } else {
          alert(data.error || 'تعذر إضافة المطعم');
        }
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFreeze = async (r: RestaurantItem) => {
    setLoadingId(r.id);
    try {
      const res = await fetch(`/api/restaurants/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFrozen: !r.isFrozen }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestaurants((prev) =>
          prev.map((item) => (item.id === r.id ? { ...item, isFrozen: !item.isFrozen } : item))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (r: RestaurantItem) => {
    if (!confirm(`تحذير: هل أنت متأكد من رغبتك في حذف مطعم "${r.name}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }
    setLoadingId(r.id);
    try {
      const res = await fetch(`/api/restaurants/${r.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestaurants((prev) => prev.filter((item) => item.id !== r.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // Filter available areas for the currently selected city in the modal
  const effectiveCity = city === 'أخرى' ? customCity : city;
  const cityFilteredAreas = areasList.filter(
    (a) => !effectiveCity || a.city === effectiveCity || a.city === 'بغداد'
  );

  const totalViews = restaurants.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

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
          <span>إضافة مطعم جديد للمنظومة</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
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
            المطاعم المسجلة: <strong style={{ color: '#fff' }}>{restaurants.length}</strong>
          </span>
        </div>
      </div>

      {/* Restaurants Table */}
      <div
        style={{
          background: '#1e293b',
          borderRadius: 20,
          border: '1px solid #334155',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>المطعم</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>التصنيف والمدينة/المنطقة</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>المميزات والخدمات</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>المشاهدات 👁️</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>التقييم</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>الحالة</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => {
              const isPending = loadingId === r.id;
              const featList = Array.isArray(r.features) ? r.features : [];

              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #334155',
                    opacity: isPending ? 0.4 : r.isFrozen ? 0.6 : 1,
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Restaurant Avatar & Name */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={r.image}
                        alt={r.name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          objectFit: 'cover',
                          border: '1px solid #334155',
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14, color: '#ffffff' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.phone || 'بدون هاتف'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category & City/Area */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span
                        style={{
                          background: 'rgba(255, 71, 87, 0.15)',
                          color: '#ff6b81',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 'bold',
                          display: 'inline-block',
                          width: 'fit-content',
                        }}
                      >
                        🏷️ {r.category}
                      </span>
                      <span style={{ fontSize: 12, color: '#38bdf8' }}>
                        🏛️ {r.city || 'بغداد'} {r.area?.name ? `• 📍 ${r.area.name}` : ''}
                      </span>
                    </div>
                  </td>

                  {/* Features Badges */}
                  <td style={{ padding: '16px 20px', maxWidth: 220 }}>
                    {featList.length === 0 ? (
                      <span style={{ fontSize: 11, color: '#64748b' }}>لا توجد مميزات محددة</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {featList.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            style={{
                              background: '#0f172a',
                              border: '1px solid #334155',
                              padding: '2px 6px',
                              borderRadius: 6,
                              fontSize: 10,
                              color: '#cbd5e1',
                            }}
                          >
                            {f}
                          </span>
                        ))}
                        {featList.length > 3 && (
                          <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 'bold' }}>
                            +{featList.length - 3} أخرى
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Views */}
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 'bold',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      👁️ {r.viewsCount || 0}
                    </span>
                  </td>

                  {/* Rating */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: 13 }}>
                      ⭐ {r.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </td>

                  {/* Freeze / Active Status */}
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        background: r.isFrozen ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                        color: r.isFrozen ? '#f87171' : '#4ade80',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 'bold',
                        border: r.isFrozen ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      {r.isFrozen ? 'مجمد ❄️' : 'نشط بالموبايل ✅'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEditModal(r)}
                        style={{
                          background: '#334155',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ تعديل
                      </button>
                      <button
                        onClick={() => toggleFreeze(r)}
                        style={{
                          background: r.isFrozen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                          color: r.isFrozen ? '#4ade80' : '#fbbf24',
                          border: r.isFrozen ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        {r.isFrozen ? 'إلغاء التجميد' : 'تجميد ❄️'}
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
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
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
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
              maxWidth: 620,
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1px solid #ff4757',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, color: '#ff6b81', margin: 0 }}>
                {editingRestaurant ? '✏️ تعديل بيانات ومميزات المطعم' : '🏪 إضافة مطعم جديد'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                  اسم المطعم: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: برغر نايت، بيتزا روما..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 9,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Governorate & Area Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#38bdf8' }}>
                    🏛️ المحافظة / المدينة: *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setAreaId('');
                    }}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}
                  >
                    {IRAQI_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        🏛️ {gov}
                      </option>
                    ))}
                    <option value="أخرى">➕ محافظة أخرى...</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#38bdf8' }}>
                    📍 المنطقة / الحي:
                  </label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: 13,
                    }}
                  >
                    <option value="">-- اختر المنطقة / الحي --</option>
                    {cityFilteredAreas.map((a) => (
                      <option key={a.id} value={a.id}>
                        📍 {a.name} ({a.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {city === 'أخرى' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#38bdf8' }}>
                    اكتب اسم المحافظة / المدينة:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="اسم المحافظة أو المدينة..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #38bdf8',
                      color: '#fff',
                      fontSize: 13,
                    }}
                  />
                </div>
              )}

              {/* Category */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                  تصنيف المطعم (Category): *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 9,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 13,
                  }}
                >
                  {dynamicCategories.length > 0 ? (
                    dynamicCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Burger">برغر (Burger)</option>
                      <option value="Pizza">بيتزا (Pizza)</option>
                      <option value="Sushi">سوشي (Sushi)</option>
                      <option value="Coffee">كافيه وقهوة (Coffee)</option>
                      <option value="Desserts">حلويات (Desserts)</option>
                      <option value="Traditional">مشاوي وأكلات شرقية</option>
                    </>
                  )}
                </select>
              </div>

              {/* Amenities & Features Multi-Checkboxes */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#fbbf24' }}>
                  ✨ المميزات والخدمات المتوفرة بالمطعم:
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                    gap: 8,
                    background: '#0f172a',
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #334155',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {ALL_RESTAURANT_FEATURES.map((feat) => {
                    const isChecked = selectedFeatures.includes(feat.id);
                    return (
                      <label
                        key={feat.id}
                        onClick={() => toggleFeature(feat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: isChecked ? 'rgba(255, 71, 87, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                          border: isChecked ? '1px solid #ff4757' : '1px solid #334155',
                          cursor: 'pointer',
                          fontSize: 12,
                          color: isChecked ? '#fff' : '#94a3b8',
                          fontWeight: isChecked ? 'bold' : 'normal',
                          transition: 'all 0.15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{feat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Address & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                    العنوان التفصيلي:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: الشارع الرئيسي، قرب المول..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                    رقم الهاتف:
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Working Hours & Rating */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                    أوقات الدوام:
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                    التقييم الأولي (⭐):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 4.5)}
                    style={{
                      width: '100%',
                      padding: 9,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fbbf24',
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 4, color: '#cbd5e1' }}>
                  صورة المطعم / الشعار:
                </label>

                {image && (
                  <div style={{ height: 120, borderRadius: 10, overflow: 'hidden', marginBottom: 8, border: '1px solid #334155' }}>
                    <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <label
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px dashed #ff4757',
                    background: '#0f172a',
                    color: '#ff6b81',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginBottom: 6,
                  }}
                >
                  📁 اختيار صورة من جهازك
                  <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: 'none' }} />
                </label>

                <input
                  type="text"
                  placeholder="أو الصق رابط صورة..."
                  value={image.startsWith('data:') ? '' : image}
                  onChange={(e) => setImage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 6,
                    borderRadius: 6,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    fontSize: 11,
                  }}
                />
              </div>

              {/* Actions */}
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
                  {isSubmitting ? 'جاري الحفظ...' : editingRestaurant ? '💾 حفظ التعديلات' : '🏪 إضافة المطعم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
