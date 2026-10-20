import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, Coupon, StoreSettings, UserProfile, OrderStatus } from '../types';
import { dbService, getStoredSupabaseConfig, configureSupabaseCredentials } from '../lib/supabase';
import { SEED_CATEGORIES, SEED_STORE_SETTINGS } from '../lib/seedData';

export type ScreenName = 
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'catalog'
  | 'details'
  | 'search'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'orders'
  | 'wishlist'
  | 'profile'
  | 'admin';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-customer-01',
  name: 'Samira Rahman',
  email: 'samira.rahman@example.com',
  phone: '+880 1712-345678',
  role: 'customer',
  defaultDistrict: 'Dhaka',
  defaultAddress: 'House 42, Road 11, Banani, Dhaka-1213',
};

const ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  name: 'Nakshi Boutique Admin',
  email: 'admin@nakshicloset.com',
  phone: '+880 1711-098765',
  role: 'admin',
  defaultDistrict: 'Dhaka',
  defaultAddress: 'Gulshan 2, Dhaka-1212',
};

export function useNakshiStore() {
  // Navigation & Screen
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(() => {
    const hasSeenOnboarding = localStorage.getItem('nakshi_onboarding_completed');
    return hasSeenOnboarding ? 'home' : 'splash';
  });

  // Device view mode: Android mockup container vs full-width responsive
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'responsive'>('mobile');

  // Selected item contexts
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string | null>(null);

  // User & Auth
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nakshi_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('nakshi_recent_searches');
    return saved ? JSON.parse(saved) : ['Jamdani', 'Crimson Saree', 'Organza Dupatta'];
  });
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nakshi_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('nakshi_wishlist');
    return saved ? JSON.parse(saved) : ['nakshi-p01', 'nakshi-p03'];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(SEED_STORE_SETTINGS);

  // UI Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Supabase Config Modal
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseConfig());

  // Show Toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Refresh products from DB
  const refreshProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const data = await dbService.getProducts();
      setProducts(data);
    } catch {
      showToast('Could not load products.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [showToast]);

  // Refresh orders from DB
  const refreshOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const data = await dbService.getOrders(user.role === 'admin' ? undefined : user.id);
      setOrders(data);
    } catch {
      showToast('Could not fetch orders.', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [user.id, user.role, showToast]);

  // Initial load
  useEffect(() => {
    refreshProducts();
    refreshOrders();
  }, [refreshProducts, refreshOrders]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('nakshi_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('nakshi_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Persist user
  useEffect(() => {
    localStorage.setItem('nakshi_current_user', JSON.stringify(user));
  }, [user]);

  // Cart operations
  const addToCart = useCallback((product: Product, variantId?: string, qty = 1) => {
    const targetVariant = product.variants.find((v) => v.id === variantId) || product.variants[0];
    if (!targetVariant) {
      showToast('Please select a product variant.', 'error');
      return;
    }
    if (targetVariant.stock < qty) {
      showToast(`Only ${targetVariant.stock} items available in stock.`, 'error');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedVariant.id === targetVariant.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        if (newQty > targetVariant.stock) {
          showToast(`Cannot add more than ${targetVariant.stock} units of this variant.`, 'error');
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      }

      const newItem: CartItem = {
        id: 'cart-' + Date.now().toString(36),
        productId: product.id,
        product,
        selectedVariant: targetVariant,
        quantity: qty,
        unitPrice: product.price,
      };
      return [...prev, newItem];
    });

    showToast(`Added "${product.name}" to bag.`);
  }, [showToast]);

  const updateCartQty = useCallback((cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      showToast('Item removed from bag.', 'info');
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          if (newQty > item.selectedVariant.stock) {
            showToast(`Only ${item.selectedVariant.stock} items in stock.`, 'error');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, [showToast]);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from shopping bag.', 'info');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  // Wishlist operations
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist ❤️');
        return [...prev, productId];
      }
    });
  }, [showToast]);

  // Apply Coupon
  const applyCouponCode = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }

    const coupons = await dbService.getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);

    if (!found) {
      showToast('Invalid or expired coupon code.', 'error');
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    if (subtotal < found.minOrderAmount) {
      showToast(`Minimum order of ৳${found.minOrderAmount.toLocaleString()} required for this coupon.`, 'error');
      return;
    }

    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied successfully!`, 'success');
  }, [cart, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  }, [showToast]);

  // Search History
  const addRecentSearch = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((k) => k.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      localStorage.setItem('nakshi_recent_searches', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('nakshi_recent_searches');
  }, []);

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const isDhakaDelivery = selectedDistrict.toLowerCase() === 'dhaka';
  const shippingFee = cartSubtotal >= storeSettings.freeShippingThreshold || cart.length === 0
    ? 0
    : isDhakaDelivery
    ? storeSettings.shippingDhaka
    : storeSettings.shippingOutsideDhaka;

  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  // Switch role between customer and admin
  const toggleRole = useCallback(() => {
    setUser((prev) => {
      const next = prev.role === 'customer' ? ADMIN_USER : DEFAULT_USER;
      showToast(`Switched role to ${next.role === 'admin' ? 'Administrator' : 'Customer'}`);
      return next;
    });
  }, [showToast]);

  // Update Supabase credentials
  const saveSupabaseKeys = useCallback((url: string, key: string) => {
    const success = configureSupabaseCredentials(url, key);
    if (success) {
      setSupabaseConfig(getStoredSupabaseConfig());
      showToast('Supabase connection configured!', 'success');
      refreshProducts();
      refreshOrders();
    } else {
      showToast('Could not initialize Supabase with those credentials.', 'error');
    }
    setIsSupabaseModalOpen(false);
  }, [showToast, refreshProducts, refreshOrders]);

  return {
    currentScreen,
    setCurrentScreen,
    deviceMode,
    setDeviceMode,
    selectedProductId,
    setSelectedProductId,
    lastPlacedOrderId,
    setLastPlacedOrderId,
    user,
    setUser,
    toggleRole,
    products,
    isLoadingProducts,
    refreshProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    sortBy,
    setSortBy,
    filterInStockOnly,
    setFilterInStockOnly,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartSubtotal,
    shippingFee,
    discountAmount,
    grandTotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    selectedDistrict,
    setSelectedDistrict,
    wishlist,
    toggleWishlist,
    orders,
    isLoadingOrders,
    refreshOrders,
    storeSettings,
    setStoreSettings,
    toasts,
    showToast,
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
    isDownloadModalOpen,
    setIsDownloadModalOpen,
    supabaseConfig,
    saveSupabaseKeys,
  };
}
