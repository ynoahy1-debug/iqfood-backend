const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Supabase database...');

  // Clean existing data
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.savedRestaurant.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.follows.deleteMany({});
  await prisma.restaurantStory.deleteMany({});
  await prisma.restaurantCollection.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const ahmed = await prisma.user.create({
    data: {
      name: 'أحمد العراقي',
      username: 'ahmed_iq',
      email: 'ahmed@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'عاشق للبرغر والاكتشافات الجديدة 🍔 | بغداد',
    },
  });

  const ali = await prisma.user.create({
    data: {
      name: 'علي حسن',
      username: 'ali_foodie',
      email: 'ali@example.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      bio: 'أبحث دائماً عن أجود أنواع القهوة والستيك ☕🥩',
    },
  });

  const sara = await prisma.user.create({
    data: {
      name: 'سارة محمد',
      username: 'sara_reviews',
      email: 'sara@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'ناقدة مطاعم وهوايتها الحلويات 🍰',
    },
  });

  const noor = await prisma.user.create({
    data: {
      name: 'نور الهدى',
      username: 'noor_taste',
      email: 'noor@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      bio: 'عشاق البيتزا والباستا 🍕',
    },
  });

  // 2. Create Follows
  await prisma.follows.createMany({
    data: [
      { followerId: ahmed.id, followingId: ali.id },
      { followerId: ahmed.id, followingId: sara.id },
      { followerId: ali.id, followingId: ahmed.id },
      { followerId: sara.id, followingId: ahmed.id },
      { followerId: noor.id, followingId: ahmed.id },
    ],
  });

  // 3. Create Restaurants
  const burgerHouse = await prisma.restaurant.create({
    data: {
      name: 'Burger House',
      description: 'أفضل برغر مشوي على الفحم في الكرادة بخلطات خاصة ولذيذة جداً.',
      category: 'Burger',
      city: 'بغداد',
      address: 'شارع عرصة الهندية، الكرادة',
      latitude: 33.3005,
      longitude: 44.4172,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      averageRating: 4.6,
    },
  });

  const pizzaSquare = await prisma.restaurant.create({
    data: {
      name: 'Pizza Square',
      description: 'بيتزا نابولية حقيقية على الحطب مع أجبان موزاريلا طازجة يومياً.',
      category: 'Pizza',
      city: 'بغداد',
      address: 'شارع 14 رمضان، المنصور',
      latitude: 33.3251,
      longitude: 44.3512,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
      averageRating: 4.8,
    },
  });

  const sushiBar = await prisma.restaurant.create({
    data: {
      name: 'Osaka Sushi',
      description: 'تجربة سوشي يابانية راقية مع أسماك طازجة وديكور مريح.',
      category: 'Sushi',
      city: 'بغداد',
      address: 'حي الجادرية، قرب الجامعة',
      latitude: 33.2789,
      longitude: 44.3911,
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600',
      averageRating: 4.4,
    },
  });

  const coffeeLab = await prisma.restaurant.create({
    data: {
      name: 'Baghdad Roastery & Coffee',
      description: 'قهوة مختصة ممتازة مع أجوآء هادئة ومكان مثالي للعمل أو الدراسة.',
      category: 'Coffee',
      city: 'بغداد',
      address: 'تقاطع الحارثية',
      latitude: 33.3142,
      longitude: 44.3701,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
      averageRating: 4.7,
    },
  });

  const steakHouse = await prisma.restaurant.create({
    data: {
      name: 'Prime Steakhouse',
      description: 'شرائح لحم واجيو وتومادوك معتقة ومجهزة بأعلى معايير الجودة.',
      category: 'Steak',
      city: 'بغداد',
      address: 'شارع الأميرات، المنصور',
      latitude: 33.3312,
      longitude: 44.3489,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
      averageRating: 4.9,
    },
  });

  const royalSweets = await prisma.restaurant.create({
    data: {
      name: 'Dolce & Sweets',
      description: 'تشكيلة وافل وكريب وكيك إيطالي فاخر محشو بالشوكولاتة.',
      category: 'Desserts',
      city: 'بغداد',
      address: 'حي الزيونة، قرب المول',
      latitude: 33.3188,
      longitude: 44.4522,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
      averageRating: 4.5,
    },
  });

  // 4. Create Reviews
  const review1 = await prisma.review.create({
    data: {
      userId: ahmed.id,
      restaurantId: burgerHouse.id,
      rating: 4.8,
      comment: 'البرغر ممتاز جداً والصوص الخاص بهم رهيب، الجلسة جميلة والخدمة سريعة ينصح به بشدة!',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600',
      status: 'APPROVED',
    },
  });

  const review2 = await prisma.review.create({
    data: {
      userId: ali.id,
      restaurantId: coffeeLab.id,
      rating: 5.0,
      comment: 'أفضل V60 ذقتها في بغداد، القهوة متوازنة وتعاملا الموظفين قمة في الأناقة.',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
      status: 'APPROVED',
    },
  });

  const review3 = await prisma.review.create({
    data: {
      userId: sara.id,
      restaurantId: pizzaSquare.id,
      rating: 4.5,
      comment: 'بيتزا المارغريتا خفيفة ولذيذة والعجينة هشة جداً مثل إيطاليا بالضبط.',
      image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600',
      status: 'APPROVED',
    },
  });

  const review4 = await prisma.review.create({
    data: {
      userId: noor.id,
      restaurantId: royalSweets.id,
      rating: 4.7,
      comment: 'الوافل بالنوتيلا والفراولة طازج والكمية كافية جداً، تجربة رائعة مع الصديقات!',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
      status: 'APPROVED',
    },
  });

  // 5. Create Likes & Comments
  await prisma.like.createMany({
    data: [
      { userId: ali.id, reviewId: review1.id },
      { userId: sara.id, reviewId: review1.id },
      { userId: noor.id, reviewId: review1.id },
      { userId: ahmed.id, reviewId: review2.id },
      { userId: ahmed.id, reviewId: review3.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { userId: ali.id, reviewId: review1.id, text: 'بالعافية حمودي، لازم أجربه هل أسبوع!' },
      { userId: sara.id, reviewId: review1.id, text: 'فعلاً مكان يستحق الزيارة 👍' },
      { userId: ahmed.id, reviewId: review2.id, text: 'عاش علاوي، شنو نوع البن اللي استخدموه؟' },
    ],
  });

  // 6. Saved Restaurants
  await prisma.savedRestaurant.createMany({
    data: [
      { userId: ahmed.id, restaurantId: burgerHouse.id, type: 'visited' },
      { userId: ahmed.id, restaurantId: pizzaSquare.id, type: 'want_to_try' },
      { userId: ahmed.id, restaurantId: steakHouse.id, type: 'favorite' },
      { userId: ahmed.id, restaurantId: coffeeLab.id, type: 'visited' },
    ],
  });

  // 7. System Settings - Auto-Approve Enabled by Default
  await prisma.systemSettings.upsert({
    where: { id: 'global' },
    update: { autoApproveAllPosts: true },
    create: { id: 'global', autoApproveAllPosts: true },
  });

  console.log('✅ Supabase Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
