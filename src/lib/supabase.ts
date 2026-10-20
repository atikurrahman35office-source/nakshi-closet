import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, Coupon, StoreSettings, UserProfile, OrderStatus } from '../types';
import { SEED_PRODUCTS, SEED_COUPONS, SEED_STORE_SETTINGS } from './seedData';

// Configurable keys from environment or user input
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('nakshi_supabase_url') || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('nakshi_supabase_anon_key') || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch {
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

export function configureSupabaseCredentials(url: string, key: string) {
  supabaseUrl = url.trim();
  supabaseAnonKey = key.trim();
  localStorage.setItem('nakshi_supabase_url', supabaseUrl);
  localStorage.setItem('nakshi_supabase_anon_key', supabaseAnonKey);
  try {
    supabaseInstance = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
    return true;
  } catch {
    return false;
  }
}

export function getStoredSupabaseConfig() {
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isConnected: !!(supabaseUrl && supabaseAnonKey && supabaseInstance),
  };
}

// STORAGE KEYS FOR LOCAL RESILIENT REPOSITORY
const STORAGE_KEYS = {
  PRODUCTS: 'nakshi_products_v1',
  ORDERS: 'nakshi_orders_v1',
  COUPONS: 'nakshi_coupons_v1',
  SETTINGS: 'nakshi_settings_v1',
  USER: 'nakshi_user_v1',
};

// Initialize local storage repository
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(SEED_COUPONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_STORE_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const initialOrder: Order = {
      id: 'ord-init-001',
      orderNumber: 'NK-89241',
      userId: 'usr-customer-01',
      customerName: 'Samira Rahman',
      customerPhone: '+880 1712-345678',
      customerEmail: 'samira.rahman@example.com',
      district: 'Dhaka',
      division: 'Dhaka',
      deliveryAddress: 'House 42, Road 11, Banani, Dhaka-1213',
      deliveryNotes: 'Call before delivery. Cash on Delivery.',
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      items: [
        {
          productId: 'nakshi-p01',
          productName: 'Royal Heritage Dhakai Jamdani Saree',
          productImage: '/src/assets/images/hero_jamdani_saree_1792493300704.jpg',
          variantId: 'v1-crimson',
          size: 'Standard (12 Hand)',
          color: 'Crimson & Gold',
          quantity: 1,
          unitPrice: 18500,
          subtotal: 18500,
        }
      ],
      subtotal: 18500,
      shippingFee: 70,
      discountAmount: 1850,
      couponCode: 'NAKSHI10',
      totalAmount: 16720,
      status: 'confirmed',
      statusHistory: [
        { status: 'pending', timestamp: '2026-03-14T10:00:00Z', note: 'Order placed by customer via Cash on Delivery' },
        { status: 'confirmed', timestamp: '2026-03-14T11:30:00Z', note: 'Order verified by boutique representative' }
      ],
      createdAt: '2026-03-14T10:00:00Z',
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([initialOrder]));
  }
}

initializeLocalStorage();

// AUTHORITATIVE BACKEND & DATABASE OPERATIONS
export const dbService = {
  async getProducts(): Promise<Product[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local repository:', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : SEED_PRODUCTS;
  },

  async saveProduct(product: Partial<Product> & { name: string; price: number; category: string }): Promise<Product> {
    const client = getSupabaseClient();
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const products: Product[] = raw ? JSON.parse(raw) : [...SEED_PRODUCTS];

    if (product.id) {
      // Update
      const index = products.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        const updated = { ...products[index], ...product };
        products[index] = updated;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

        if (client) {
          try {
            await client.from('products').update(product).eq('id', product.id);
          } catch (e) {
            console.error('Supabase update failed:', e);
          }
        }
        return updated;
      }
    }

    // Insert
    const newProduct: Product = {
      id: 'nakshi-p' + Date.now().toString(36),
      name: product.name,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: product.category as any,
      categoryName: product.categoryName || product.category,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0,
      description: product.description || 'Exclusive handcrafted Bangladeshi boutique design from Nakshi Closet.',
      fabric: product.fabric || 'Pure Premium Silk & Muslin',
      craftType: product.craftType || 'Artisanal Embroidery',
      images: product.images && product.images.length > 0 ? product.images : ['/src/assets/images/hero_jamdani_saree_1792493300704.jpg'],
      variants: product.variants && product.variants.length > 0 ? product.variants : [
        { id: 'v-' + Date.now(), size: 'Standard (12 Hand)', color: 'Crimson Red', stock: 5, sku: 'NK-NEW-01' }
      ],
      inStock: true,
      totalStock: product.totalStock || 5,
      isNewArrival: true,
      rating: 5.0,
      reviewsCount: 1,
      created_at: new Date().toISOString(),
    };

    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (client) {
      try {
        await client.from('products').insert([newProduct]);
      } catch (e) {
        console.error('Supabase insert failed:', e);
      }
    }

    return newProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return false;
    const products: Product[] = JSON.parse(raw);
    const filtered = products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('products').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete error:', e);
      }
    }
    return true;
  },

  async getOrders(userId?: string): Promise<Order[]> {
    const client = getSupabaseClient();
    if (client && userId) {
      try {
        const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Order[];
        }
      } catch (err) {
        console.warn('Supabase getOrders fallback:', err);
      }
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const orders: Order[] = raw ? JSON.parse(raw) : [];
    if (userId && userId !== 'usr-admin-01') {
      return orders.filter((o) => o.userId === userId);
    }
    return orders;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) return false;
    const orders: Order[] = JSON.parse(raw);
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return false;

    orders[orderIndex].status = newStatus;
    orders[orderIndex].statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').update({
          status: newStatus,
          status_history: orders[orderIndex].statusHistory,
        }).eq('id', orderId);
      } catch (e) {
        console.error('Supabase order update failed:', e);
      }
    }

    return true;
  },

  // Authoritative Checkout Verification & Atomic Stock Reduction
  async processCheckout(payload: {
    userId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    district: string;
    division: string;
    deliveryAddress: string;
    deliveryNotes?: string;
    couponCode?: string;
    paymentMethod: 'COD' | 'SSLCOMMERZ' | 'BKASH';
    cartItems: {
      productId: string;
      variantId: string;
      quantity: number;
    }[];
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    // Revalidate authoritative prices and inventory from DB/repository
    const products = await this.getProducts();
    const coupons = await this.getCoupons();
    const settings = await this.getStoreSettings();

    const orderItems: Order['items'] = [];
    let authoritativeSubtotal = 0;

    for (const item of payload.cartItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product with ID ${item.productId} was not found.` };
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        return { success: false, error: `Variant for ${product.name} is no longer available.` };
      }

      if (variant.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name} (${variant.size}, ${variant.color}). Available: ${variant.stock}, requested: ${item.quantity}.`,
        };
      }

      const lineTotal = product.price * item.quantity;
      authoritativeSubtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '',
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: lineTotal,
      });

      // Deduct stock
      variant.stock -= item.quantity;
      product.totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
      product.inStock = product.totalStock > 0;
    }

    // Authoritative Shipping calculation
    const isDhaka = payload.district.toLowerCase() === 'dhaka';
    let shippingFee = isDhaka ? settings.shippingDhaka : settings.shippingOutsideDhaka;
    if (authoritativeSubtotal >= settings.freeShippingThreshold) {
      shippingFee = 0;
    }

    // Authoritative Discount calculation
    let discountAmount = 0;
    if (payload.couponCode) {
      const activeCoupon = coupons.find(
        (c) => c.code.toUpperCase() === payload.couponCode!.toUpperCase() && c.isActive
      );
      if (activeCoupon && authoritativeSubtotal >= activeCoupon.minOrderAmount) {
        if (activeCoupon.discountType === 'percentage') {
          discountAmount = (authoritativeSubtotal * activeCoupon.discountValue) / 100;
          if (activeCoupon.maxDiscount && discountAmount > activeCoupon.maxDiscount) {
            discountAmount = activeCoupon.maxDiscount;
          }
        } else {
          discountAmount = activeCoupon.discountValue;
        }
      }
    }

    const totalAmount = Math.max(0, authoritativeSubtotal + shippingFee - discountAmount);

    const newOrder: Order = {
      id: 'ord-' + Date.now().toString(36),
      orderNumber: 'NK-' + Math.floor(10000 + Math.random() * 90000),
      userId: payload.userId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      district: payload.district,
      division: payload.division,
      deliveryAddress: payload.deliveryAddress,
      deliveryNotes: payload.deliveryNotes,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'COD' ? 'pending' : 'pending',
      items: orderItems,
      subtotal: authoritativeSubtotal,
      shippingFee,
      discountAmount,
      couponCode: payload.couponCode,
      totalAmount,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: `Order placed via ${payload.paymentMethod}. Awaiting boutique confirmation.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    // Save updated product stock to local repository
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Save order
    const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const existingOrders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
    existingOrders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));

    // If real Supabase client is configured, push to database
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('orders').insert([newOrder]);
      } catch (err) {
        console.error('Supabase order creation sync failed:', err);
      }
    }

    return { success: true, order: newOrder };
  },

  async getCoupons(): Promise<Coupon[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    return raw ? JSON.parse(raw) : SEED_COUPONS;
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    const list: Coupon[] = raw ? JSON.parse(raw) : [...SEED_COUPONS];
    const idx = list.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.push(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(list));
  },

  async getStoreSettings(): Promise<StoreSettings> {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : SEED_STORE_SETTINGS;
  },

  async updateStoreSettings(settings: StoreSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
