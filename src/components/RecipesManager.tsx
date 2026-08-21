'use client';

import React, { useState } from 'react';

interface Creator {
  id: string;
  name: string;
  handle: string;
  type: string;
  recipesCount: number;
  totalSales: string;
  status: string;
}

interface RecipeItem {
  id: string;
  title: string;
  category: string;
  author: string;
  accessType: 'FREE' | 'VIP' | 'PAID';
  price: string;
  salesCount: number;
  image: string;
}

export default function RecipesManager() {
  const [creators, setCreators] = useState<Creator[]>([
    {
      id: 'cr1',
      name: 'الشيف شاهين',
      handle: '@chef_shaheen',
      type: '🍳 شيف معتمد',
      recipesCount: 42,
      totalSales: '145,000 د.ع',
      status: 'موثق ✅',
    },
    {
      id: 'cr2',
      name: 'الشيف أم علي',
      handle: '@um_ali_kitchen',
      type: '🍳 شيف معتمد',
      recipesCount: 28,
      totalSales: '98,000 د.ع',
      status: 'موثق ✅',
    },
    {
      id: 'cr3',
      name: 'الشيف عمر',
      handle: '@chef_omar',
      type: '🍳 شيف معتمد',
      recipesCount: 19,
      totalSales: '62,000 د.ع',
      status: 'موثق ✅',
    },
  ]);

  const [recipes, setRecipes] = useState<RecipeItem[]>([
    {
      id: 'rec_vip1',
      title: 'ماستر كلاس: القوزي البغدادي على الفحم 👑',
      category: 'أطباق رئيسية',
      author: 'الشيف شاهين',
      accessType: 'VIP',
      price: 'حصرية VIP 👑',
      salesCount: 142,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
    },
    {
      id: 'rec_paid1',
      title: 'سر الصوص الذهبي للبرغر وشوي الاستيك 💎',
      category: 'وجبات سريعة',
      author: 'الشيف عمر',
      accessType: 'PAID',
      price: '3,000 د.ع',
      salesCount: 89,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    },
    {
      id: 'rec1',
      title: 'الدولمة العراقية الأصلية 🍲',
      category: 'أطباق رئيسية',
      author: 'الشيف أم علي',
      accessType: 'FREE',
      price: 'مجانية 🟢',
      salesCount: 310,
      image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
    },
  ]);

  // Modal State for Adding Recipe
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showAddCreatorModal, setShowAddCreatorModal] = useState(false);

  // New Recipe Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('أطباق رئيسية');
  const [newAuthor, setNewAuthor] = useState('الشيف شاهين');
  const [newAccessType, setNewAccessType] = useState<'FREE' | 'VIP' | 'PAID'>('FREE');
  const [newPrice, setNewPrice] = useState('3,500 د.ع');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');

  // New Creator Form Fields
  const [newCreatorName, setNewCreatorName] = useState('');
  const [newCreatorHandle, setNewCreatorHandle] = useState('');

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: RecipeItem = {
      id: `rec_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      author: newAuthor,
      accessType: newAccessType,
      price: newAccessType === 'FREE' ? 'مجانية 🟢' : newAccessType === 'VIP' ? 'حصرية VIP 👑' : newPrice,
      salesCount: 0,
      image: newImage,
    };

    setRecipes([newItem, ...recipes]);
    setShowAddRecipeModal(false);
    setNewTitle('');
    alert('تم نشر وإضافة الوصفة بنجاح في التطبيق والداشبورد! 🍳');
  };

  const handleAddCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreatorName.trim()) return;

    const newCreator: Creator = {
      id: `cr_${Date.now()}`,
      name: newCreatorName,
      handle: newCreatorHandle.startsWith('@') ? newCreatorHandle : `@${newCreatorHandle}`,
      type: '🍳 شيف معتمد',
      recipesCount: 0,
      totalSales: '0 د.ع',
      status: 'موثق ✅',
    };

    setCreators([...creators, newCreator]);
    setShowAddCreatorModal(false);
    setNewCreatorName('');
    setNewCreatorHandle('');
    alert('تم إضافة وتوثيق صانع المحتوى الجديد بنجاح! 👨‍🍳');
  };

  const toggleAccessType = (id: string, currentAccess: 'FREE' | 'VIP' | 'PAID') => {
    const nextAccess: 'FREE' | 'VIP' | 'PAID' =
      currentAccess === 'FREE' ? 'VIP' : currentAccess === 'VIP' ? 'PAID' : 'FREE';

    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            accessType: nextAccess,
            price: nextAccess === 'FREE' ? 'مجانية 🟢' : nextAccess === 'VIP' ? 'حصرية VIP 👑' : '4,000 د.ع',
          };
        }
        return r;
      })
    );
  };

  const deleteRecipe = (id: string) => {
    if (confirm('هل أنت تأكد من رغبتك بحذف هذه الوصفة؟')) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      {/* Top Action Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setShowAddRecipeModal(true)}
          style={{
            background: '#ff4757',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 14,
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ➕ إضافة وصفة جديدة للتطبيق
        </button>
        <button
          onClick={() => setShowAddCreatorModal(true)}
          style={{
            background: '#9333ea',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 14,
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          👨‍🍳 إضافة وتوثيق شيف جديد
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <h3>إجمالي الوصفات المنشورة 📖</h3>
          <div className="val">{recipes.length}</div>
        </div>
        <div className="stat-card">
          <h3>الوصفات المدفوعة 💎</h3>
          <div className="val" style={{ color: '#a855f7' }}>
            {recipes.filter((r) => r.accessType === 'PAID').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>الوصفات الحصرية VIP 👑</h3>
          <div className="val" style={{ color: '#eab308' }}>
            {recipes.filter((r) => r.accessType === 'VIP').length}
          </div>
        </div>
        <div className="stat-card">
          <h3>إجمالي المبيعات والأرباح 💰</h3>
          <div className="val" style={{ color: '#4ade80' }}>
            305,000 د.ع
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW RECIPE */}
      {showAddRecipeModal && (
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
              maxWidth: 520,
              width: '100%',
              border: '1px solid #ff4757',
            }}
          >
            <h2 style={{ marginBottom: 16 }}>🍳 إضافة ونشر وصفة جديدة من الداشبورد</h2>
            <form onSubmit={handleAddRecipe}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>عنوان الوصفة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دولمة عراقية، كبة الموصل..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>التصنيف:</label>
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
                    <option value="أطباق رئيسية">أطباق رئيسية 🍲</option>
                    <option value="سلطات ومقبلات">سلطات ومقبلات 🥗</option>
                    <option value="حلويات">حلويات 🍰</option>
                    <option value="وجبات سريعة">وجبات سريعة ⏱️</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>الشيف صاحب الوصفة:</label>
                  <select
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  >
                    {creators.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>نوع الصلاحية والوصول:</label>
                  <select
                    value={newAccessType}
                    onChange={(e) => setNewAccessType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 10,
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                    }}
                  >
                    <option value="FREE">🟢 مجانية للجميع</option>
                    <option value="VIP">👑 حصرية لمشتركي VIP</option>
                    <option value="PAID">💎 مدفوعة فردياً (ماستر كلاس)</option>
                  </select>
                </div>
                {newAccessType === 'PAID' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>سعر الوصفة (د.ع):</label>
                    <input
                      type="text"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
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
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>رابط صورة الوصفة:</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
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

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddRecipeModal(false)}
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
                  type="submit"
                  style={{
                    background: '#ff4757',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  نشر الوصفة الآن 🍳
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CREATOR */}
      {showAddCreatorModal && (
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
              maxWidth: 440,
              width: '100%',
              border: '1px solid #9333ea',
            }}
          >
            <h2 style={{ marginBottom: 16 }}>👨‍🍳 اعتماد وتوثيق صانع محتوى طعام جديد</h2>
            <form onSubmit={handleAddCreator}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>اسم الشيف / صانع المحتوى:</label>
                <input
                  type="text"
                  required
                  placeholder="الشيف عمر، الشيف ريتا..."
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>حساب الإنستغرام (@handle):</label>
                <input
                  type="text"
                  required
                  placeholder="@chef_handle"
                  value={newCreatorHandle}
                  onChange={(e) => setNewCreatorHandle(e.target.value)}
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

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCreatorModal(false)}
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
                  type="submit"
                  style={{
                    background: '#9333ea',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: 10,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  توثيق واعتماد الشيف 🍳
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipes Management Table */}
      <div className="table-card" style={{ marginBottom: 24 }}>
        <h2>📖 التحكم بالوصفات وحالات الوصول ({recipes.length})</h2>
        <table>
          <thead>
            <tr>
              <th>صورة الوصفة</th>
              <th>عنوان الوصفة</th>
              <th>التصنيف</th>
              <th>صانع الوصفة</th>
              <th>نوع الصلاحية</th>
              <th>السعر بالدينار</th>
              <th>المبيعات / المشاهدات</th>
              <th>التحكم والموافقة</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((r) => (
              <tr key={r.id}>
                <td>
                  <img
                    src={r.image}
                    alt={r.title}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                  />
                </td>
                <td>
                  <strong>{r.title}</strong>
                </td>
                <td>
                  <span className="badge-cat">{r.category}</span>
                </td>
                <td>{r.author}</td>
                <td>
                  <button
                    onClick={() => toggleAccessType(r.id, r.accessType)}
                    style={{
                      background:
                        r.accessType === 'FREE'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : r.accessType === 'VIP'
                          ? 'rgba(234, 179, 8, 0.2)'
                          : 'rgba(147, 51, 234, 0.2)',
                      color:
                        r.accessType === 'FREE'
                          ? '#4ade80'
                          : r.accessType === 'VIP'
                          ? '#eab308'
                          : '#a855f7',
                      border: '1px solid currentColor',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontWeight: 'bold',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {r.accessType === 'FREE'
                      ? '🟢 مجانية (تغيير 🔄)'
                      : r.accessType === 'VIP'
                      ? '👑 VIP (تغيير 🔄)'
                      : '💎 مدفوعة (تغيير 🔄)'}
                  </button>
                </td>
                <td>
                  <strong style={{ color: '#fbbf24' }}>{r.price}</strong>
                </td>
                <td>{r.salesCount} عمليات شراء/فتح</td>
                <td>
                  <button
                    onClick={() => deleteRecipe(r.id)}
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
                    حذف 🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Food Creators Directory Table */}
      <div className="table-card" style={{ border: '1px solid rgba(234, 179, 8, 0.3)' }}>
        <h2>🍳 دليل وتوثيق صناع المحتوى والشيفات المعتمدين ({creators.length})</h2>
        <table>
          <thead>
            <tr>
              <th>الشيف / صانع المحتوى</th>
              <th>الحساب</th>
              <th>الصفة والتصنيف</th>
              <th>عدد الوصفات المنشورة</th>
              <th>إجمالي المبيعات والأرباح</th>
              <th>حالة التوثيق</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{c.handle}</td>
                <td>
                  <span style={{ color: '#eab308', fontWeight: 'bold' }}>{c.type}</span>
                </td>
                <td>{c.recipesCount} وصفات</td>
                <td>
                  <strong style={{ color: '#4ade80' }}>{c.totalSales}</strong>
                </td>
                <td>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontWeight: 'bold',
                      fontSize: 12,
                    }}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
