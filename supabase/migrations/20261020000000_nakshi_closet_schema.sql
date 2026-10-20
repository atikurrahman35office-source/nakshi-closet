-- ==============================================================================
-- NAKSHI CLOSET — PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS MIGRATION
-- Migration: 20261020000000_nakshi_closet_schema.sql
-- Covers: 16 tables, UUID PKs, Foreign Keys, Indexes, RLS Policies & Atomic Checkout
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  default_district TEXT DEFAULT 'Dhaka',
  default_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_slug TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12, 2) CHECK (original_price >= price),
  discount_percent INT DEFAULT 0,
  description TEXT NOT NULL,
  fabric TEXT NOT NULL,
  craft_type TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  total_stock INT NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CARTS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_cart UNIQUE (user_id)
);

-- 7. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_cart_variant UNIQUE (cart_id, variant_id)
);

-- 8. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_wishlist UNIQUE (user_id)
);

-- 9. WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- 10. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  district TEXT NOT NULL,
  division TEXT,
  address_line TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  district TEXT NOT NULL,
  division TEXT DEFAULT 'Dhaka',
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'SSLCOMMERZ', 'BKASH')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. ORDER ITEMS TABLE (Immutable snapshot of purchase)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_id UUID,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 13. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. COUPON REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'Nakshi Closet',
  store_phone TEXT NOT NULL DEFAULT '+880 1711-098765',
  store_email TEXT NOT NULL DEFAULT 'boutique@nakshicloset.com',
  shipping_dhaka NUMERIC(10, 2) NOT NULL DEFAULT 70.00,
  shipping_outside_dhaka NUMERIC(10, 2) NOT NULL DEFAULT 130.00,
  free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 15000.00,
  allow_cash_on_delivery BOOLEAN NOT NULL DEFAULT true,
  currency_symbol TEXT NOT NULL DEFAULT '৳',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. PROMOTIONAL BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_category TEXT,
  badge_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT DEFAULT 0
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by owner" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile except role" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Categories & Products: Anyone can read, only admin can write
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify products" ON public.products
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify variants" ON public.product_variants
  FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update order status" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Users can view order items of own orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Carts Policies
CREATE POLICY "Users manage own cart" ON public.carts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    )
  );

-- Wishlist Policies
CREATE POLICY "Users manage own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own wishlist items" ON public.wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid()
    )
  );

-- Store Settings Policies
CREATE POLICY "Anyone can read store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update store settings" ON public.store_settings
  FOR UPDATE USING (public.is_admin());

-- ==============================================================================
-- ATOMIC SECURE CHECKOUT STORED PROCEDURE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_checkout_rpc(order_data JSONB)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_variant RECORD;
  v_subtotal NUMERIC(12, 2) := 0;
  v_shipping_fee NUMERIC(12, 2) := 70;
  v_discount NUMERIC(12, 2) := 0;
  v_total NUMERIC(12, 2);
  v_order_id UUID;
  v_order_number TEXT;
BEGIN
  -- Generate unique order number
  v_order_number := 'NK-' || floor(10000 + random() * 90000)::text;

  -- Verify each item and deduct inventory atomically
  FOR v_item IN SELECT * FROM jsonb_to_recordset(order_data->'cart_items') AS x(product_id UUID, variant_id UUID, quantity INT)
  LOOP
    SELECT * INTO v_variant FROM public.product_variants WHERE id = v_item.variant_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant % not found', v_item.variant_id;
    END IF;

    IF v_variant.stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for SKU %. Available: %, requested: %', v_variant.sku, v_variant.stock, v_item.quantity;
    END IF;

    SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id;
    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);

    -- Reduce variant stock
    UPDATE public.product_variants
    SET stock = stock - v_item.quantity
    WHERE id = v_item.variant_id;
  END LOOP;

  -- Determine shipping
  IF (order_data->>'district')::text ILIKE 'Dhaka' THEN
    v_shipping_fee := 70;
  ELSE
    v_shipping_fee := 130;
  END IF;

  v_total := v_subtotal + v_shipping_fee - v_discount;

  -- Insert order
  INSERT INTO public.orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    district, delivery_address, delivery_notes, payment_method,
    subtotal, shipping_fee, discount_amount, total_amount, status
  ) VALUES (
    v_order_number, (order_data->>'user_id')::UUID, order_data->>'customer_name', order_data->>'customer_phone', order_data->>'customer_email',
    order_data->>'district', order_data->>'delivery_address', order_data->>'delivery_notes', order_data->>'payment_method',
    v_subtotal, v_shipping_fee, v_discount, v_total, 'pending'
  ) RETURNING id INTO v_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'order_number', v_order_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
