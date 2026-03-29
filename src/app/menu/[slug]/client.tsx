'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  Leaf,
  Flame,
  AlertCircle,
  Check,
  Utensils,
  Package,
  Bike,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// Types
interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  discountPrice: number | null;
  prepTime: number | null;
  calories: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spicyLevel: number;
  variants: { id: string; name: string; price: number; isDefault: boolean }[];
  options: {
    id: string;
    name: string;
    required: boolean;
    multiSelect: boolean;
    values: { id: string; name: string; price: number }[];
  }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  items: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categories: Category[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  district: string | null;
  isOpen: boolean;
  isBusy: boolean;
  acceptsDelivery: boolean;
  acceptsTakeaway: boolean;
  acceptsDineIn: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryTime: number;
  rating: number;
  reviewCount: number;
  currency: { code: string; symbol: string; name: string };
  settings: {
    acceptsCash: boolean;
    acceptsMobileMoney: boolean;
    acceptsCard: boolean;
    deliveryEnabled: boolean;
    minOrderAmount: number;
    defaultDeliveryFee: number;
  } | null;
  hours: { dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }[];
  deliveryZones: { id: string; name: string; baseFee: number; minTime: number; maxTime: number }[];
  menus: Menu[];
}

export default function PublicMenuClient({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway' | 'dine-in'>('delivery');

  const { items, addItem, removeItem, updateQuantity, getTotal, getItemCount, clearCart } = useCartStore();

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/restaurant/${slug}`);
        if (!res.ok) {
          throw new Error('Restaurant non trouvé');
        }
        const data = await res.json();
        setRestaurant(data.data);
        // Set first menu as default
        if (data.data.menus?.length > 0) {
          setSelectedMenuId(data.data.menus[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchRestaurant();
    }
  }, [slug]);

  // Get current menu
  const currentMenu = useMemo(() => {
    if (!restaurant?.menus) return null;
    return restaurant.menus.find(m => m.id === selectedMenuId) || restaurant.menus[0];
  }, [restaurant?.menus, selectedMenuId]);

  // Get all categories from current menu
  const categories = useMemo(() => {
    if (!currentMenu?.categories) return [];
    return [
      { id: 'all', name: 'Tout', icon: '🍽️', items: [] },
      ...currentMenu.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || '🍴',
        items: cat.items,
      })),
    ];
  }, [currentMenu]);

  // Get all items for filtering
  const allItems = useMemo(() => {
    if (!currentMenu?.categories) return [];
    return currentMenu.categories.flatMap(cat => cat.items);
  }, [currentMenu]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => {
        const category = currentMenu?.categories.find(cat =>
          cat.items.some(i => i.id === item.id)
        );
        return category?.id === selectedCategory;
      });
    }

    return items;
  }, [allItems, searchQuery, selectedCategory, currentMenu]);

  // Cart handlers
  const handleAddToCart = useCallback((item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discountPrice ?? item.price,
      image: item.image || undefined,
      quantity: 1,
    });
    toast.success(`${item.name} ajouté au panier`);
  }, [addItem]);

  const handleIncrease = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  }, [items, updateQuantity]);

  const handleDecrease = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      if (item.quantity <= 1) {
        removeItem(itemId);
      } else {
        updateQuantity(itemId, item.quantity - 1);
      }
    }
  }, [items, updateQuantity, removeItem]);

  const getItemQuantity = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.quantity || 0;
  }, [items]);

  // Format price
  const formatPrice = useCallback((price: number) => {
    if (!restaurant?.currency) {
      return `${price.toLocaleString()}`;
    }
    return `${price.toLocaleString()} ${restaurant.currency.code}`;
  }, [restaurant?.currency]);

  // Cart total
  const cartTotal = getTotal();
  const cartCount = getItemCount();
  const minOrder = restaurant?.minOrderAmount || restaurant?.settings?.minOrderAmount || 0;
  const deliveryFee = restaurant?.deliveryFee || restaurant?.settings?.defaultDeliveryFee || 0;
  const canOrder = cartTotal >= minOrder;

  // Checkout handler
  const handleCheckout = useCallback(() => {
    if (!canOrder) {
      toast.error(`Minimum de commande: ${formatPrice(minOrder)}`);
      return;
    }
    // Navigate to checkout page
    router.push(`/menu/${slug}/checkout`);
  }, [canOrder, minOrder, formatPrice, router, slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 -mt-12">
          <Skeleton className="w-24 h-24 rounded-full bg-white shadow-lg" />
          <Skeleton className="h-8 w-48 mt-4" />
          <Skeleton className="h-4 w-32 mt-2" />
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Restaurant non trouvé</h1>
            <p className="text-gray-500 mt-2">{error || 'Ce restaurant n\'existe pas ou n\'est plus disponible.'}</p>
            <Button className="mt-6" onClick={() => window.location.href = '/'}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header with cover image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-orange-400 to-red-500">
        {restaurant.coverImage && (
          <Image
            src={restaurant.coverImage}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button for mobile */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {restaurant.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-white/90 text-sm">
            {restaurant.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {restaurant.deliveryTime} min
            </span>
            {restaurant.isOpen ? (
              <Badge className="bg-green-500 text-white">Ouvert</Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Fermé</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant logo */}
      {restaurant.logo && (
        <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
          <div className="w-20 h-20 rounded-xl bg-white shadow-lg overflow-hidden border-4 border-white">
            <Image
              src={restaurant.logo}
              alt={restaurant.name}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {/* Restaurant details */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {restaurant.address}, {restaurant.city}
          </span>
          <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 text-orange-600">
            <Phone className="w-4 h-4" />
            {restaurant.phone}
          </a>
        </div>

        {/* Order type selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {restaurant.acceptsDelivery && (
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                orderType === 'delivery'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Bike className="w-4 h-4" />
              Livraison
              {deliveryFee > 0 && <span className="text-xs">({formatPrice(deliveryFee)})</span>}
            </button>
          )}
          {restaurant.acceptsTakeaway && (
            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                orderType === 'takeaway'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Package className="w-4 h-4" />
              Emporté
            </button>
          )}
          {restaurant.acceptsDineIn && (
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                orderType === 'dine-in'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <Store className="w-4 h-4" />
              Sur place
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher un plat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Categories horizontal scroll */}
        <ScrollArea className="w-full mb-4">
          <div className="flex gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Menu items */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Aucun plat trouvé</p>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              const price = item.discountPrice ?? item.price;
              const hasDiscount = item.discountPrice && item.discountPrice < item.price;

              return (
                <Card
                  key={item.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 relative">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl">
                            🍽️
                          </div>
                        )}
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          {item.isPopular && (
                            <Badge className="bg-orange-500 text-white text-xs py-0.5">
                              <Flame className="w-3 h-3 mr-0.5" />
                              Populaire
                            </Badge>
                          )}
                          {item.isNew && (
                            <Badge className="bg-green-500 text-white text-xs py-0.5">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-3 sm:p-4 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                              {item.name}
                            </h3>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {hasDiscount ? (
                              <>
                                <span className="font-bold text-orange-600 text-lg">
                                  {formatPrice(item.discountPrice!)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  {formatPrice(item.price)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-orange-600 text-lg">
                                {formatPrice(item.price)}
                              </span>
                            )}
                            {item.prepTime && (
                              <span className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.prepTime} min
                              </span>
                            )}
                            {item.isVegetarian && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                <Leaf className="w-3 h-3 mr-1" />
                                Végétarien
                              </Badge>
                            )}
                            {item.isSpicy && (
                              <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                                🌶️ Épicé
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Add to cart button */}
                        <div className="flex items-center justify-end mt-2">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleDecrease(item.id)}
                                className="w-10 h-10 rounded-full border-2 border-orange-500 text-orange-500 flex items-center justify-center hover:bg-orange-50 active:scale-95 transition-all"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                              <button
                                onClick={() => handleIncrease(item.id)}
                                className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.isAvailable}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all active:scale-95 ${
                                item.isAvailable
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-5 h-5" />
                              Ajouter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Minimum order notice */}
        {minOrder > 0 && cartTotal > 0 && cartTotal < minOrder && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Minimum de commande: {formatPrice(minOrder)}. Ajoutez encore{' '}
              {formatPrice(minOrder - cartTotal)}.
            </p>
          </div>
        )}
      </div>

      {/* Fixed cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4 safe-area-bottom">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {cartCount} article{cartCount > 1 ? 's' : ''}
                </span>
                {orderType === 'delivery' && deliveryFee > 0 && (
                  <span className="text-sm text-gray-500">
                    + {formatPrice(deliveryFee)} livraison
                  </span>
                )}
              </div>
              <p className="font-bold text-orange-600 text-lg">
                {formatPrice(cartTotal + (orderType === 'delivery' ? deliveryFee : 0))}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={!canOrder || !restaurant.isOpen}
              className={`px-6 py-3 rounded-xl font-semibold ${
                canOrder && restaurant.isOpen
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Commander
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
