'use client';

import React, { useState } from 'react';

export interface AreaItem {
  id: string;
  name: string;
  city: string;
  order: number;
  createdAt: string;
  _count?: {
    restaurants: number;
  };
}

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

export default function AreasManager({ initialAreas }: { initialAreas: AreaItem[] }) {
  const [areas, setAreas] = useState<AreaItem[]>(initialAreas);
  const [selectedCityFilter, setSelectedCityFilter] = useState('الكل');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('بغداد');
  const [customCity, setCustomCity] = useState('');
  const [order, setOrder] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingArea(null);
    setName('');
    setCity(selectedCityFilter !== 'الكل' ? selectedCityFilter : 'بغداد');
    setCustomCity('');
    setOrder(areas.length);
    setShowAddModal(true);
  };

  const openEditModal = (area: AreaItem) => {
    setEditingArea(area);
    setName(area.name);
    if (IRAQI_GOVERNORATES.includes(area.city)) {
      setCity(area.city);
      setCustomCity('');
    } else {
      setCity('أخرى');
      setCustomCity(area.city);
    }
    setOrder(area.order || 0);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('يرجى كتابة اسم المنطقة أو الحي');
      return;
    }

    const finalCity = city === 'أخرى' ? (customCity.trim() || 'أخرى') : city;

    try {
      setIsSubmitting(true);
      if (editingArea) {
        // Edit
        const res = await fetch(`/api/areas/${editingArea.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            city: finalCity,
            order: Number(order) || 0,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAreas((prev) =>
            prev.map((a) => (a.id === editingArea.id ? { ...a, ...data.data } : a))
          );
          setShowAddModal(false);
          setEditingArea(null);
          alert('تم تعديل المنطقة بنجاح!');
        } else {
          alert(data.error || 'تعذر تعديل المنطقة');
        }
      } else {
        // Create
        const res = await fetch('/api/areas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            city: finalCity,
            order: Number(order) || 0,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAreas((prev) => [...prev, data.data]);
          setShowAddModal(false);
          alert('تمت إضافة المنطقة بنجاح وتظهر الآن في فلاتر التطبيق! 🎉');
        } else {
          alert(data.error || 'تعذر إضافة المنطقة');
        }
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (area: AreaItem) => {
    if (!confirm(`هل أنت متأكد من حذف منطقة "${area.name}" التابعة لمحافظة ${area.city}؟`)) return;

    setLoadingId(area.id);
    try {
      const res = await fetch(`/api/areas/${area.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAreas((prev) => prev.filter((a) => a.id !== area.id));
      } else {
        alert(data.error || 'تعذر حذف المنطقة');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredAreas = selectedCityFilter === 'الكل'
    ? areas
    : areas.filter((a) => a.city === selectedCityFilter);

  const totalRestaurants = areas.reduce((acc, curr) => acc + (curr._count?.restaurants || 0), 0);

  return (
    <div>
      {/* Top Action Bar & Quick Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <button
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
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
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)',
          }}
        >
          <span style={{ fontSize: 16 }}>📍</span>
          <span>إضافة منطقة / حي جديد</span>
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
            إجمالي المناطق المسجلة: <strong style={{ color: '#fff' }}>{areas.length}</strong>
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
            المطاعم المصنفة بالمناطق: <strong style={{ color: '#fff' }}>{totalRestaurants}</strong>
          </span>
        </div>
      </div>

      {/* Governorate / City Tabs Filter */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 }}>
          🏢 تصفية المناطق حسب المحافظة:
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['الكل', ...IRAQI_GOVERNORATES].map((gov) => {
            const isSelected = selectedCityFilter === gov;
            const count = gov === 'الكل' ? areas.length : areas.filter((a) => a.city === gov).length;
            return (
              <button
                key={gov}
                onClick={() => setSelectedCityFilter(gov)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)' : '#1e293b',
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {gov} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Areas Table */}
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
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>الترتيب</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>اسم المنطقة / الحي</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>المحافظة / المدينة</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>عدد المطاعم المسجلة</th>
              <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredAreas.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: 'center', color: '#94a3b8' }}>
                  لا توجد مناطق مسجلة لهذه المحافظة حالياً. اضغط على "إضافة منطقة / حي جديد" لإضافتها.
                </td>
              </tr>
            ) : (
              filteredAreas.map((area, index) => {
                const isDeleting = loadingId === area.id;
                return (
                  <tr
                    key={area.id}
                    style={{
                      borderBottom: '1px solid #334155',
                      opacity: isDeleting ? 0.4 : 1,
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: 13, fontWeight: 'bold' }}>
                      #{area.order !== undefined ? area.order : index}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#ffffff', fontSize: 14, fontWeight: 'bold' }}>
                      📍 {area.name}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          background: 'rgba(14, 165, 233, 0.15)',
                          color: '#38bdf8',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        🏛️ {area.city || 'بغداد'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        🏪 {area._count?.restaurants || 0} مطعم
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => openEditModal(area)}
                          style={{
                            background: '#334155',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(area)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
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
              border: '1px solid #38bdf8',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #334155', paddingBottom: 12 }}>
              <h2 style={{ fontSize: 18, color: '#38bdf8', margin: 0 }}>
                {editingArea ? '✏️ تعديل المنطقة / الحي' : '📍 إضافة منطقة / حي جديد'}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              {/* Select Governorate */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                  المحافظة / المدينة: *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 10,
                    background: '#0f172a',
                    border: '1px solid #334155',
                    color: '#38bdf8',
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {IRAQI_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      🏛️ {gov}
                    </option>
                  ))}
                  <option value="أخرى">➕ محافظة / مدينة أخرى...</option>
                </select>
              </div>

              {city === 'أخرى' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                    اكتب اسم المحافظة أو المدينة الجديدة: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: دهوك، الأنبار، بابل..."
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #38bdf8',
                      color: '#fff',
                      fontSize: 14,
                    }}
                  />
                </div>
              )}

              {/* Area Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                  اسم المنطقة / الحي (مثال: عينكاوة، الجزائر، الكوفة، المنصور): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم المنطقة..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              {/* Order */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 6, color: '#cbd5e1' }}>
                  الترتيب في القوائم والفلاتر:
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
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
                    background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'جاري الحفظ...' : editingArea ? '💾 حفظ التعديلات' : '📍 إضافة المنطقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
