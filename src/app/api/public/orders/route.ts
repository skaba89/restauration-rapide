// Public Orders API - Create orders without authentication
// For customer-facing ordering interface
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// POST /api/public/orders - Create a new order
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();

    const {
      restaurantId,
      orderType = 'DELIVERY',
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryDistrict,
      deliveryZoneId,
      deliveryNotes,
      paymentMethod = 'CASH',
      notes,
      items,
      subtotal,
      deliveryFee = 0,
      total,
    } = body;

    // Validation
    if (!restaurantId) {
      return apiError('Restaurant ID est requis', 400);
    }
    if (!customerName || !customerPhone) {
      return apiError('Nom et téléphone sont requis', 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('Au moins un article est requis', 400);
    }
    if (orderType === 'DELIVERY' && !deliveryAddress) {
      return apiError('Adresse de livraison requise', 400);
    }

    // Verify restaurant exists and is active
    const restaurant = await db.restaurant.findFirst({
      where: {
        id: restaurantId,
        isActive: true,
      },
      include: {
        organization: {
          include: {
            currency: true,
          },
        },
      },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Get or create currency
    const currencyId = restaurant.organization.currencyId;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        restaurantId,
        customerName,
        customerPhone,
        customerEmail,
        orderType: orderType as any,
        source: 'web',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        deliveryAddress,
        deliveryCity,
        deliveryDistrict,
        deliveryZoneId,
        deliveryNotes,
        deliveryFee,
        subtotal,
        tax: 0,
        total,
        currencyId,
        notes,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            itemName: item.name,
            itemImage: item.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        currencyId,
        method: paymentMethod as any,
        status: 'PENDING',
        phoneNumber: paymentMethod === 'MOBILE_MONEY' ? customerPhone : null,
      },
    });

    // Create delivery record if delivery
    if (orderType === 'DELIVERY') {
      await db.delivery.create({
        data: {
          orderId: order.id,
          organizationId: restaurant.organizationId,
          pickupAddress: `${restaurant.address}, ${restaurant.city}`,
          pickupLat: restaurant.latitude,
          pickupLng: restaurant.longitude,
          dropoffAddress: deliveryAddress,
          dropoffLat: null,
          dropoffLng: null,
          dropoffLandmark: deliveryNotes,
          status: 'PENDING',
          deliveryFee,
          driverEarning: deliveryFee * 0.7, // 70% to driver
        },
      });
    }

    // Add status history
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        notes: 'Commande créée',
      },
    });

    return apiSuccess({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      message: 'Commande créée avec succès',
    }, 'Commande créée avec succès', 201);
  });
}
