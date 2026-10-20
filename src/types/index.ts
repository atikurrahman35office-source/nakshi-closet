export type ProductCategory = 
  | 'sarees'
  | 'salwar-kameez'
  | 'kurtis'
  | 'three-piece'
  | 'festive'
  | 'accessories';

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  categoryName: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  description: string;
  fabric: string;
  craftType: string;
  images: string[];
  variants: ProductVariant[];
  inStock: boolean;
  totalStock: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewsCount: number;
  created_at?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedVariant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  productImage: string;
  variantId: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  district: string;
  division: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  paymentMethod: 'COD' | 'SSLCOMMERZ' | 'BKASH';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: OrderItemSnapshot[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  shippingDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingThreshold: number;
  allowCashOnDelivery: boolean;
  currencySymbol: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  defaultDistrict?: string;
  defaultAddress?: string;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkCategory?: ProductCategory;
  badgeText?: string;
  isActive: boolean;
}
