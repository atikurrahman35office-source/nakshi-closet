-- ==============================================================================
-- NAKSHI CLOSET — SEED DATA SCRIPT
-- Execute in Supabase SQL Editor after running schema migration
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO public.categories (name, slug, description, display_order)
VALUES 
  ('Sarees', 'sarees', 'Dhakai Jamdani, Mirpur Katan, Silk, Muslin & Organza Drapes', 1),
  ('Salwar Kameez', 'salwar-kameez', 'Embroidered festive sets with organza and silk dupattas', 2),
  ('Kurtis', 'kurtis', 'Contemporary hand-embroidered muslin, silk, and velvet tunics', 3),
  ('Three-Piece Sets', 'three-piece', 'Luxury three-piece matching ensembles with bottoms and dupattas', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Store Settings
INSERT INTO public.store_settings (store_name, store_phone, store_email, shipping_dhaka, shipping_outside_dhaka, free_shipping_threshold)
VALUES ('Nakshi Closet', '+880 1711-098765', 'boutique@nakshicloset.com', 70.00, 130.00, 15000.00);

-- 3. Insert Coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount, is_active)
VALUES
  ('NAKSHI10', '10% privilege discount on orders above ৳4,000', 'percentage', 10.00, 4000.00, 1500.00, true),
  ('EID500', 'Flat ৳500 OFF on festive purchases above ৳5,000', 'fixed', 500.00, 5000.00, NULL, true),
  ('WELCOME15', '15% welcome discount for new shoppers', 'percentage', 15.00, 3000.00, 2000.00, true)
ON CONFLICT (code) DO NOTHING;

-- 4. Insert Products & Variants
DO $$
DECLARE
  v_cat_sarees UUID;
  v_cat_salwar UUID;
  v_cat_kurtis UUID;
  v_p1_id UUID;
  v_p2_id UUID;
  v_p3_id UUID;
  v_p4_id UUID;
BEGIN
  SELECT id INTO v_cat_sarees FROM public.categories WHERE slug = 'sarees';
  SELECT id INTO v_cat_salwar FROM public.categories WHERE slug = 'salwar-kameez';
  SELECT id INTO v_cat_kurtis FROM public.categories WHERE slug = 'kurtis';

  -- Product 1: Royal Dhakai Jamdani
  INSERT INTO public.products (
    name, slug, category_id, category_slug, price, original_price, discount_percent,
    description, fabric, craft_type, in_stock, total_stock, is_new_arrival, is_best_seller, is_featured
  ) VALUES (
    'Royal Heritage Dhakai Jamdani Saree', 'royal-dhakai-jamdani-saree', v_cat_sarees, 'sarees',
    18500.00, 22000.00, 16,
    'Exquisite handwoven royal Dhakai Jamdani saree with antique gold zari and deep crimson thread jaal motifs.',
    'Fine 84-Count Muslin Cotton with Zari', 'Traditional Jamdani Weft-Weave',
    true, 10, true, true, true
  ) RETURNING id INTO v_p1_id;

  INSERT INTO public.product_variants (product_id, size, color, color_hex, stock, sku)
  VALUES 
    (v_p1_id, 'Standard (12 Hand)', 'Crimson & Gold', '#8B2635', 6, 'NK-JAM-CR-01'),
    (v_p1_id, 'Standard (12 Hand)', 'Ivory & Gold', '#FAF7F2', 4, 'NK-JAM-IV-02');

  -- Product 2: Mirpur Crimson Katan
  INSERT INTO public.products (
    name, slug, category_id, category_slug, price, original_price, discount_percent,
    description, fabric, craft_type, in_stock, total_stock, is_new_arrival, is_best_seller, is_featured
  ) VALUES (
    'Mirpur Crimson Katan Silk Saree', 'mirpur-crimson-katan-silk-saree', v_cat_sarees, 'sarees',
    14500.00, 16800.00, 14,
    'Bridal pure Mulberry Katan silk saree woven in Mirpur Benarasi Polli with antique gold kalga motifs.',
    '100% Pure Mulberry Katan Silk', 'Mirpur Benarasi Brocade Weave',
    true, 13, true, true, true
  ) RETURNING id INTO v_p2_id;

  INSERT INTO public.product_variants (product_id, size, color, color_hex, stock, sku)
  VALUES 
    (v_p2_id, 'Standard (12 Hand)', 'Deep Burgundy Red', '#681825', 8, 'NK-KAT-RD-01'),
    (v_p2_id, 'Standard (12 Hand)', 'Emerald Green', '#1B4D3E', 5, 'NK-KAT-GN-02');

  -- Product 3: Festive Emerald Salwar Suit
  INSERT INTO public.products (
    name, slug, category_id, category_slug, price, original_price, discount_percent,
    description, fabric, craft_type, in_stock, total_stock, is_new_arrival, is_best_seller, is_featured
  ) VALUES (
    'Festive Emerald Three-Piece Salwar Suit', 'emerald-festive-salwar-suit', v_cat_salwar, 'salwar-kameez',
    9200.00, 11500.00, 20,
    'Handcrafted luxury festive suit with tilla resham embroidery and scallop organza jacquard dupatta.',
    'Raw Silk & Pure Organza Dupatta', 'Tilla, Zari & Resham Hand Embroidery',
    true, 19, true, false, true
  ) RETURNING id INTO v_p3_id;

  INSERT INTO public.product_variants (product_id, size, color, color_hex, stock, sku)
  VALUES 
    (v_p3_id, 'M (38")', 'Emerald Green', '#1B4D3E', 10, 'NK-SAL-EM-M'),
    (v_p3_id, 'L (40")', 'Emerald Green', '#1B4D3E', 9, 'NK-SAL-EM-L');

  -- Product 4: Ivory Muslin Kurti
  INSERT INTO public.products (
    name, slug, category_id, category_slug, price, original_price, discount_percent,
    description, fabric, craft_type, in_stock, total_stock, is_new_arrival, is_best_seller, is_featured
  ) VALUES (
    'Ivory Hand-Embroidered Muslin Kurti', 'ivory-embroidered-muslin-kurti', v_cat_kurtis, 'kurtis',
    4600.00, 5200.00, 12,
    'Airy pure muslin kurti with delicate wine-red kashida needlework and natural mother-of-pearl buttons.',
    'Pure Bengal Muslin Cotton', 'Kashida Needlework & Pearl Studding',
    true, 21, false, true, true
  ) RETURNING id INTO v_p4_id;

  INSERT INTO public.product_variants (product_id, size, color, color_hex, stock, sku)
  VALUES 
    (v_p4_id, 'M (38")', 'Ivory Cream', '#FAF7F2', 12, 'NK-KUR-IV-M'),
    (v_p4_id, 'L (40")', 'Ivory Cream', '#FAF7F2', 9, 'NK-KUR-IV-L');

END $$;
