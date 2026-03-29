// Setup API - Initialize KFM DELICE Restaurant
// Call this endpoint once after deployment to set up the restaurant
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

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
  priceRange: 2,
};

const KFM_ADMIN = {
  email: 'kfm.delice@guinee.com',
  password: 'KfmDelice2024!',
  phone: '+224622000001',
  firstName: 'KFM',
  lastName: 'DELICE',
};

const MENU_CATEGORIES = [
  { name: 'Plats Principaux', description: 'Nos plats traditionnels et spéciaux', order: 1 },
  { name: 'Plats Traditionnels', description: 'Saveurs authentiques de Guinée', order: 2 },
  { name: 'Grillades', description: 'Viandes et poissons grillés', order: 3 },
  { name: 'Fast Food', description: 'Burgers, chawarma et sandwiches', order: 4 },
  { name: 'Accompagnements', description: 'Frites, alloco et salades', order: 5 },
  { name: 'Boissons', description: 'Jus naturels et boissons fraîches', order: 6 },
  { name: 'Desserts', description: 'Douceurs et fruits', order: 7 },
];

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

const DELIVERY_ZONES = [
  { name: 'Kaloum', city: 'Conakry', fee: 5000, minOrder: 10000 },
  { name: 'Dixinn', city: 'Conakry', fee: 5000, minOrder: 10000 },
  { name: 'Ratoma', city: 'Conakry', fee: 5000, minOrder: 10000 },
  { name: 'Matam', city: 'Conakry', fee: 6000, minOrder: 10000 },
  { name: 'Matoto', city: 'Conakry', fee: 6000, minOrder: 10000 },
  { name: 'Simbaya', city: 'Conakry', fee: 7000, minOrder: 15000 },
  { name: 'Yimbaya', city: 'Conakry', fee: 7000, minOrder: 15000 },
  { name: 'Cosa', city: 'Conakry', fee: 7000, minOrder: 15000 },
];

export async function POST(request: NextRequest) {
  try {
    // Check if already set up
    const existingRestaurant = await db.restaurant.findUnique({
      where: { slug: KFM_DELICE.slug },
    });

    if (existingRestaurant) {
      return apiError('KFM DELICE est déjà configuré', 400);
    }

    // Get Guinea and GNF
    const guinea = await db.country.findUnique({ where: { code: 'GN' } });
    const gnf = await db.currency.findUnique({ where: { code: 'GNF' } });

    if (!guinea || !gnf) {
      return apiError('Guinée ou Franc Guinéen non trouvé. Exécutez d\'abord le seed principal.', 400);
    }

    // Create Organization
    const org = await db.organization.create({
      data: {
        name: KFM_DELICE.name,
        slug: 'kfm-delice-org',
        email: KFM_DELICE.email,
        phone: KFM_DELICE.phone,
        city: KFM_DELICE.city,
        countryId: guinea.id,
        currencyId: gnf.id,
        plan: 'BUSINESS',
        isActive: true,
        settings: {
          create: {
            minOrderAmount: 10000,
            maxDeliveryRadius: 15,
            defaultDeliveryFee: 5000,
            orderPrepTime: 20,
            reservationEnabled: true,
            acceptsCash: true,
            acceptsMobileMoney: true,
            acceptsCard: false,
            deliveryEnabled: true,
            loyaltyEnabled: true,
            pointsPerAmount: 100,
            pointValue: 500,
          },
        },
      },
    });

    // Create Admin User
    const hashedPassword = await bcrypt.hash(KFM_ADMIN.password, BCRYPT_SALT_ROUNDS);
    const user = await db.user.create({
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

    // Link user to organization
    await db.organizationUser.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'admin',
      },
    });

    // Create Restaurant
    const restaurant = await db.restaurant.create({
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

    // Create Menu
    const menu = await db.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Notre menu complet',
        isActive: true,
        sortOrder: 1,
      },
    });

    // Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of MENU_CATEGORIES) {
      const created = await db.menuCategory.create({
        data: {
          menuId: menu.id,
          restaurantId: restaurant.id,
          name: cat.name,
          description: cat.description,
          sortOrder: cat.order,
          isActive: true,
        },
      });
      categoryMap[cat.name] = created.id;
    }

    // Create Menu Items
    for (const item of MENU_ITEMS) {
      const categoryId = categoryMap[item.category];
      if (!categoryId) continue;

      await db.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          prepTime: item.prepTime,
          isAvailable: true,
          isPopular: item.isPopular || false,
          isNew: item.isNew || false,
        },
      });
    }

    // Create Delivery Zones
    for (const zone of DELIVERY_ZONES) {
      await db.deliveryZone.create({
        data: {
          restaurantId: restaurant.id,
          name: zone.name,
          city: zone.city,
          deliveryFee: zone.fee,
          minOrderAmount: zone.minOrder,
          estimatedTime: 45,
          isActive: true,
        },
      });
    }

    return apiSuccess({
      message: 'KFM DELICE configuré avec succès !',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      admin: {
        email: KFM_ADMIN.email,
        password: KFM_ADMIN.password,
      },
      menuUrl: `/menu/${restaurant.slug}`,
      stats: {
        categories: MENU_CATEGORIES.length,
        items: MENU_ITEMS.length,
        deliveryZones: DELIVERY_ZONES.length,
      },
    });

  } catch (error) {
    console.error('Setup error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Erreur lors de la configuration',
      500
    );
  }
}
