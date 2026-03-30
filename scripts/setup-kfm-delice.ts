// ============================================
// KFM DELICE - Restaurant Setup Script
// Production configuration for Guinea
// ============================================

import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

// KFM DELICE Configuration
const KFM_DELICE = {
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  slogan: 'Les saveurs délicieuses de Guinée',
  description: 'Restaurant fast-food guinéen offrant des plats traditionnels et modernes avec une qualité exceptionnelle.',
  phone: '+224622000000',
  email: 'contact@kfm-delice.com',
  address: 'Kaloum, Conakry',
  city: 'Conakry',
  district: 'Kaloum',
  cuisine: ['Guinéenne', 'Fast Food', 'Africaine'],
  color: '#FF6B35',
  priceRange: 2,
  openHours: {
    monday: { open: '08:00', close: '22:00' },
    tuesday: { open: '08:00', close: '22:00' },
    wednesday: { open: '08:00', close: '22:00' },
    thursday: { open: '08:00', close: '22:00' },
    friday: { open: '08:00', close: '23:00' },
    saturday: { open: '09:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' },
  },
};

// Admin user for KFM DELICE
const KFM_ADMIN = {
  email: 'kfm.delice@guinee.com',
  password: 'KfmDelice2024!',
  phone: '+224622000001',
  firstName: 'KFM',
  lastName: 'DELICE',
};

// Menu items for KFM DELICE
const MENU_ITEMS = [
  // Plats Principaux
  { name: 'Poulet Yassa', description: 'Poulet mariné au citron avec oignons caramélisés, accompagné de riz', price: 45000, category: 'Plats Principaux', prepTime: 25, isPopular: true },
  { name: 'Riz Gras', description: 'Riz aux tomates fraîches, légumes et viande au choix', price: 25000, category: 'Plats Principaux', prepTime: 20, isPopular: true },
  { name: 'Poulet DG', description: 'Poulet sauté avec plantains frits et légumes', price: 50000, category: 'Plats Principaux', prepTime: 25, isPopular: true },
  { name: 'Fou Fou Guinéen', description: 'Pâte de manioc avec sauce arachide', price: 35000, category: 'Plats Traditionnels', prepTime: 30 },
  { name: 'Konkoé', description: 'Pâte de manioc avec sauce graine', price: 30000, category: 'Plats Traditionnels', prepTime: 30 },
  { name: 'Tô Maïs', description: 'Boule de maïs avec sauce tomate', price: 20000, category: 'Plats Traditionnels', prepTime: 20 },
  
  // Grillades
  { name: 'Poulet Braisé', description: 'Demi-poulet grillé aux épices guinéennes', price: 35000, category: 'Grillades', prepTime: 30, isPopular: true },
  { name: 'Brochettes de Bœuf', description: '5 brochettes de bœuf marinées', price: 25000, category: 'Grillades', prepTime: 20 },
  { name: 'Poisson Grillé', description: 'Poisson entier grillé au feu de bois', price: 40000, category: 'Grillades', prepTime: 25 },
  { name: 'Mix Grill', description: 'Assortiment de viandes grillées', price: 55000, category: 'Grillades', prepTime: 35, isNew: true },
  
  // Fast Food
  { name: 'Burger KFM', description: 'Burger maison avec viande fraîche et sauce spéciale', price: 20000, category: 'Fast Food', prepTime: 15, isPopular: true },
  { name: 'Chawarma Poulet', description: 'Chawarma au poulet grillé avec sauce', price: 15000, category: 'Fast Food', prepTime: 10, isPopular: true },
  { name: 'Chawarma Viande', description: 'Chawarma à la viande épicée', price: 18000, category: 'Fast Food', prepTime: 10 },
  { name: 'Sandwich Poulet', description: 'Sandwich au poulet pané avec frites', price: 15000, category: 'Fast Food', prepTime: 12 },
  { name: 'Tacos KFM', description: 'Tacos garnis au choix', price: 18000, category: 'Fast Food', prepTime: 15, isNew: true },
  
  // Accompagnements
  { name: 'Alloco', description: 'Bananes plantain frites croustillantes', price: 5000, category: 'Accompagnements', prepTime: 10, isPopular: true },
  { name: 'Frites', description: 'Frites de pommes de terre maison', price: 5000, category: 'Accompagnements', prepTime: 10 },
  { name: 'Riz Blanc', description: 'Riz blanc parfumé', price: 3000, category: 'Accompagnements', prepTime: 15 },
  { name: 'Salade', description: 'Salade fraîche de saison', price: 5000, category: 'Accompagnements', prepTime: 5 },
  
  // Boissons
  { name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', price: 3000, category: 'Boissons', prepTime: 3, isPopular: true },
  { name: 'Jus de Gingembre', description: 'Jus de gingembre frais et épicé', price: 3000, category: 'Boissons', prepTime: 3 },
  { name: 'Jus de Baobab', description: 'Jus de fruit de baobab', price: 3500, category: 'Boissons', prepTime: 3 },
  { name: 'Café Touba', description: 'Café épicé traditionnel', price: 2000, category: 'Boissons', prepTime: 5 },
  { name: 'Ataya', description: 'Thé à la menthe guinéen', price: 2000, category: 'Boissons', prepTime: 10 },
  { name: 'Eau Minérale', description: 'Eau minérale naturelle', price: 1500, category: 'Boissons', prepTime: 0 },
  { name: 'Soda', description: 'Boisson gazeuse', price: 2000, category: 'Boissons', prepTime: 0 },
  
  // Desserts
  { name: 'Fruits de Saison', description: 'Assiette de fruits frais', price: 5000, category: 'Desserts', prepTime: 5 },
  { name: 'Banane Caramel', description: 'Bananes flambées au caramel', price: 7000, category: 'Desserts', prepTime: 10, isNew: true },
  { name: 'Gâteau Maison', description: 'Gâteau fait maison du jour', price: 6000, category: 'Desserts', prepTime: 5 },
];

// Menu Categories
const MENU_CATEGORIES = [
  { name: 'Plats Principaux', description: 'Nos plats traditionnels et spéciaux', order: 1, icon: 'utensils' },
  { name: 'Plats Traditionnels', description: 'Saveurs authentiques de Guinée', order: 2, icon: 'mortar-pestle' },
  { name: 'Grillades', description: 'Viandes et poissons grillés', order: 3, icon: 'flame' },
  { name: 'Fast Food', description: 'Burgers, chawarma et sandwiches', order: 4, icon: 'burger' },
  { name: 'Accompagnements', description: 'Frites, alloco et salades', order: 5, icon: 'side-dish' },
  { name: 'Boissons', description: 'Jus naturels et boissons fraîches', order: 6, icon: 'cup' },
  { name: 'Desserts', description: 'Douceurs et fruits', order: 7, icon: 'cake' },
];

async function main() {
  console.log('🍽️ Configuration de KFM DELICE...\n');

  // 1. Get Guinea country and GNF currency
  console.log('🌍 Récupération des données Guinée...');
  const guinea = await db.country.findUnique({ where: { code: 'GN' } });
  const gnf = await db.currency.findUnique({ where: { code: 'GNF' } });

  if (!guinea || !gnf) {
    throw new Error('Guinée ou Franc Guinéen non trouvé dans la base de données');
  }

  // 2. Create Organization
  console.log('🏢 Création de l\'organisation KFM DELICE...');
  const org = await db.organization.upsert({
    where: { slug: 'kfm-delice-org' },
    update: {
      name: KFM_DELICE.name,
      email: KFM_DELICE.email,
      phone: KFM_DELICE.phone,
      city: KFM_DELICE.city,
      countryId: guinea.id,
      currencyId: gnf.id,
      plan: 'BUSINESS',
      isActive: true,
    },
    create: {
      name: KFM_DELICE.name,
      slug: 'kfm-delice-org',
      email: KFM_DELICE.email,
      phone: KFM_DELICE.phone,
      city: KFM_DELICE.city,
      countryId: guinea.id,
      currencyId: gnf.id,
      plan: 'BUSINESS',
      isActive: true,
    },
  });

  // Create organization settings
  await db.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      minOrderAmount: 10000,
      maxDeliveryRadius: 15,
      defaultDeliveryFee: 5000,
      orderPrepTime: 20,
      reservationEnabled: true,
      autoConfirmReservations: false,
      defaultTableTime: 90,
      noShowFee: 25000,
      acceptsCash: true,
      acceptsMobileMoney: true,
      acceptsCard: false,
      deliveryEnabled: true,
      loyaltyEnabled: true,
      pointsPerAmount: 100,
      pointValue: 500,
    },
  });

  // 3. Create Admin User
  console.log('👤 Création de l\'administrateur...');
  const hashedPassword = await bcrypt.hash(KFM_ADMIN.password, BCRYPT_SALT_ROUNDS);
  
  let user = await db.user.findUnique({ where: { email: KFM_ADMIN.email } });
  
  if (!user) {
    user = await db.user.create({
      data: {
        email: KFM_ADMIN.email,
        phone: KFM_ADMIN.phone,
        passwordHash: hashedPassword,
        firstName: KFM_ADMIN.firstName,
        lastName: KFM_ADMIN.lastName,
        role: 'ORG_ADMIN',
        isActive: true,
      },
    });
    console.log('  ✓ Utilisateur créé');
  } else {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    console.log('  ✓ Mot de passe mis à jour');
  }

  // Link user to organization
  await db.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: { role: 'admin' },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'admin',
    },
  });

  // 4. Create Restaurant
  console.log('🍽️ Création du restaurant...');
  
  // Check if restaurant exists first
  let restaurant = await db.restaurant.findFirst({
    where: { slug: KFM_DELICE.slug, organizationId: org.id },
  });
  
  if (restaurant) {
    restaurant = await db.restaurant.update({
      where: { id: restaurant.id },
      data: {
      name: KFM_DELICE.name,
      description: KFM_DELICE.description,
      phone: KFM_DELICE.phone,
      address: KFM_DELICE.address,
      city: KFM_DELICE.city,
      district: KFM_DELICE.district,
      countryId: guinea.id,
      restaurantType: 'restaurant',
      cuisines: JSON.stringify(KFM_DELICE.cuisine),
      priceRange: KFM_DELICE.priceRange,
      acceptsReservations: true,
      acceptsDelivery: true,
      acceptsTakeaway: true,
      acceptsDineIn: true,
      deliveryFee: 5000,
      minOrderAmount: 10000,
      maxDeliveryRadius: 15,
      isActive: true,
      isOpen: true,
    },
  });
  } else {
    restaurant = await db.restaurant.create({
      data: {
        organizationId: org.id,
        name: KFM_DELICE.name,
        slug: KFM_DELICE.slug,
        description: KFM_DELICE.description,
        phone: KFM_DELICE.phone,
        address: KFM_DELICE.address,
        city: KFM_DELICE.city,
        district: KFM_DELICE.district,
        countryId: guinea.id,
        restaurantType: 'restaurant',
        cuisines: JSON.stringify(KFM_DELICE.cuisine),
        priceRange: KFM_DELICE.priceRange,
        acceptsReservations: true,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        deliveryFee: 5000,
        minOrderAmount: 10000,
        maxDeliveryRadius: 15,
        isActive: true,
        isOpen: true,
      },
    });
  }

  // 5. Create Menu first
  console.log('📋 Création du menu...');
  let menu = await db.menu.findFirst({
    where: { restaurantId: restaurant.id },
  });
  
  if (!menu) {
    menu = await db.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Menu complet de KFM DELICE',
        isActive: true,
        sortOrder: 1,
      },
    });
    console.log('  ✓ Menu créé');
  }

  // 6. Create Menu Categories
  console.log('📂 Création des catégories de menu...');
  const categoryMap: Record<string, string> = {};
  
  for (const cat of MENU_CATEGORIES) {
    const existing = await db.menuCategory.findFirst({
      where: { menuId: menu.id, name: cat.name },
    });
    
    if (!existing) {
      const created = await db.menuCategory.create({
        data: {
          menuId: menu.id,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
          description: cat.description,
          sortOrder: cat.order,
          isActive: true,
        },
      });
      categoryMap[cat.name] = created.id;
      console.log(`  ✓ ${cat.name}`);
    } else {
      categoryMap[cat.name] = existing.id;
    }
  }

  // 7. Create Menu Items
  console.log('🍕 Création des articles du menu...');
  
  for (const item of MENU_ITEMS) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) continue;

    const existing = await db.menuItem.findFirst({
      where: { categoryId: categoryId, name: item.name },
    });

    if (!existing) {
      await db.menuItem.create({
        data: {
          categoryId: categoryId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: item.description,
          price: item.price,
          prepTime: item.prepTime,
          isAvailable: true,
          isPopular: item.isPopular || false,
          isNew: item.isNew || false,
        },
      });
      console.log(`  ✓ ${item.name}`);
    }
  }

  // 7. Create Delivery Zones for Guinea
  console.log('🚚 Création des zones de livraison...');
  
  const guineaZones = [
    // Conakry
    { name: 'Kaloum', description: 'Quartier Kaloum, Conakry', fee: 5000, minOrder: 10000 },
    { name: 'Dixinn', description: 'Quartier Dixinn, Conakry', fee: 5000, minOrder: 10000 },
    { name: 'Ratoma', description: 'Quartier Ratoma, Conakry', fee: 5000, minOrder: 10000 },
    { name: 'Matam', description: 'Quartier Matam, Conakry', fee: 6000, minOrder: 10000 },
    { name: 'Matoto', description: 'Quartier Matoto, Conakry', fee: 6000, minOrder: 10000 },
    { name: 'Simbaya', description: 'Quartier Simbaya, Conakry', fee: 7000, minOrder: 15000 },
    { name: 'Yimbaya', description: 'Quartier Yimbaya, Conakry', fee: 7000, minOrder: 15000 },
    { name: 'Cosa', description: 'Quartier Cosa, Conakry', fee: 7000, minOrder: 15000 },
    // Autres villes
    { name: 'Kamsar', description: 'Ville de Kamsar, Boké', fee: 50000, minOrder: 50000 },
    { name: 'Boké', description: 'Ville de Boké', fee: 60000, minOrder: 50000 },
    { name: 'Kindia', description: 'Ville de Kindia', fee: 30000, minOrder: 30000 },
    { name: 'Mamou', description: 'Ville de Mamou', fee: 35000, minOrder: 35000 },
    { name: 'Labé', description: 'Ville de Labé', fee: 40000, minOrder: 40000 },
    { name: 'Kankan', description: 'Ville de Kankan', fee: 45000, minOrder: 45000 },
    { name: 'Nzérékoré', description: 'Ville de Nzérékoré', fee: 50000, minOrder: 50000 },
  ];

  for (const zone of guineaZones) {
    const existing = await db.deliveryZone.findFirst({
      where: { restaurantId: restaurant.id, name: zone.name },
    });

    if (!existing) {
      await db.deliveryZone.create({
        data: {
          restaurantId: restaurant.id,
          name: zone.name,
          description: zone.description,
          baseFee: zone.fee,
          minOrder: zone.minOrder,
          minTime: 30,
          maxTime: 60,
          isActive: true,
        },
      });
      console.log(`  ✓ ${zone.name}`);
    }
  }

  console.log('\n✅ Configuration terminée avec succès !\n');
  console.log('═══════════════════════════════════════════');
  console.log('🔐 IDENTIFIANTS DE CONNEXION KFM DELICE');
  console.log('═══════════════════════════════════════════');
  console.log(`📧 Email: ${KFM_ADMIN.email}`);
  console.log(`🔑 Mot de passe: ${KFM_ADMIN.password}`);
  console.log(`📱 Téléphone: ${KFM_ADMIN.phone}`);
  console.log('═══════════════════════════════════════════');
  console.log(`🌐 URL du menu: /menu/${KFM_DELICE.slug}`);
  console.log('═══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
