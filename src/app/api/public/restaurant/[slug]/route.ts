// Public Restaurant API - Fetch restaurant by slug with menu data
// No authentication required
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/public/restaurant/[slug] - Get restaurant with menu by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return withErrorHandler(async () => {
    const { slug } = await params;

    // Find restaurant by slug
    const restaurant = await db.restaurant.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        country: {
          select: {
            id: true,
            code: true,
            name: true,
            dialCode: true,
            defaultLanguage: true,
            currencyId: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            currencyId: true,
            currency: {
              select: {
                id: true,
                code: true,
                symbol: true,
                name: true,
              },
            },
            settings: {
              select: {
                acceptsCash: true,
                acceptsMobileMoney: true,
                acceptsCard: true,
                deliveryEnabled: true,
                minOrderAmount: true,
                defaultDeliveryFee: true,
              },
            },
          },
        },
        menus: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            categories: {
              where: { isActive: true },
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
              include: {
                items: {
                  where: { isAvailable: true },
                  orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                  include: {
                    variants: {
                      orderBy: { sortOrder: 'asc' },
                    },
                    options: {
                      include: {
                        values: {
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                      orderBy: { sortOrder: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
        deliveryZones: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        hours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Get currency
    const currency = restaurant.organization.currency;

    // Format response
    const response = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      address2: restaurant.address2,
      city: restaurant.city,
      district: restaurant.district,
      landmark: restaurant.landmark,
      country: restaurant.country,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      acceptsDelivery: restaurant.acceptsDelivery,
      acceptsTakeaway: restaurant.acceptsTakeaway,
      acceptsDineIn: restaurant.acceptsDineIn,
      acceptsReservations: restaurant.acceptsReservations,
      deliveryFee: restaurant.deliveryFee,
      minOrderAmount: restaurant.minOrderAmount,
      deliveryTime: restaurant.deliveryTime,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      isOpen: restaurant.isOpen,
      isBusy: restaurant.isBusy,
      currency,
      settings: restaurant.organization.settings,
      hours: restaurant.hours,
      deliveryZones: restaurant.deliveryZones,
      menus: restaurant.menus.map(menu => ({
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        description: menu.description,
        menuType: menu.menuType,
        categories: menu.categories.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          icon: category.icon,
          items: category.items.map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            image: item.image,
            price: item.price,
            discountPrice: item.discountPrice,
            prepTime: item.prepTime,
            calories: item.calories,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            isPopular: item.isPopular,
            isNew: item.isNew,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isHalal: item.isHalal,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy,
            spicyLevel: item.spicyLevel,
            variants: item.variants,
            options: item.options,
          })),
        })),
      })),
    };

    return apiSuccess(response);
  });
}
