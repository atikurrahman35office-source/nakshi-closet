import React, { useState } from 'react';
import { Product, ProductVariant } from '../types';
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, ShieldCheck, Check, Info } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailScreenProps {
  productId: string;
  products: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, variantId?: string, qty?: number) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  onSelectProduct: (id: string) => void;
  wishlist: string[];
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  productId,
  products,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onSelectProduct,
  wishlist,
}) => {
  const product = products.find((p) => p.id === productId) || products[0];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: 'v-default',
      size: 'Standard',
      color: 'Default',
      stock: 5,
      sku: 'SKU-01',
    }
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p>Product not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#53121C] text-white rounded">
          Return to Catalog
        </button>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 2);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (quantity > variant.stock) {
      setQuantity(Math.max(1, variant.stock));
    }
  };

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= selectedVariant.stock) {
      setQuantity(next);
    }
  };

  return (
    <div className="pb-32 bg-[#FDFBF7] min-h-screen">
      {/* Top Floating Bar with Back and Wishlist */}
      <div className="relative">
        {/* Main Product Image Carousel */}
        <div className="relative aspect-3/4 sm:aspect-1/1 w-full bg-stone-100 overflow-hidden">
          <img
            src={product.images[selectedImageIndex] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={onBack}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-stone-800 hover:text-[#53121C] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md transition-colors ${
                isWishlisted ? 'text-[#53121C]' : 'text-stone-700 hover:text-[#53121C]'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#53121C]' : ''}`} />
            </button>
          </div>

          {/* Image index indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-sm rounded-full">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedImageIndex ? 'w-5 bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <div className="flex gap-2 p-3 bg-white border-b border-stone-200 overflow-x-auto">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-14 h-16 rounded-md overflow-hidden border-2 shrink-0 ${
                  idx === selectedImageIndex ? 'border-[#53121C]' : 'border-stone-200'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Details Module */}
      <div className="p-4 bg-white border-b border-stone-200/80">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
          <span className="uppercase tracking-widest font-semibold text-[#53121C]">
            {product.categoryName}
          </span>
          <div className="flex items-center gap-1 text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-semibold tabular-nums">{product.rating}</span>
            <span className="text-stone-400">({product.reviewsCount} reviews)</span>
          </div>
        </div>

        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
          {product.name}
        </h1>

        {/* Price Lockup */}
        <div className="flex items-baseline gap-3 mt-2.5">
          <span className="text-2xl font-bold text-stone-900 tabular-nums">
            ৳{product.price.toLocaleString()}
          </span>
          {product.originalPrice ? (
            <span className="text-sm text-stone-400 line-through tabular-nums">
              ৳{product.originalPrice.toLocaleString()}
            </span>
          ) : null}
          {product.discountPercent ? (
            <span className="bg-[#53121C] text-white text-xs font-semibold px-2 py-0.5 rounded-sm">
              Save {product.discountPercent}%
            </span>
          ) : null}
        </div>

        {/* Stock Status */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          {selectedVariant.stock > 0 ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
              <Check className="w-3.5 h-3.5" />
              <span>In Stock ({selectedVariant.stock} units available)</span>
            </span>
          ) : (
            <span className="text-rose-700 font-medium bg-rose-50 px-2 py-1 rounded">
              Currently Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Variant Selection (Size & Color) */}
      <div className="p-4 bg-white mt-2 border-y border-stone-200/80">
        {/* Size Selection */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-stone-900">Select Size</span>
            <span className="text-stone-500">Selected: {selectedVariant.size}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => handleVariantSelect(v)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-[#53121C] bg-[#53121C] text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400'
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Indicator */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-stone-900">Color Palette</span>
            <span className="text-stone-600">{selectedVariant.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-stone-300 shadow-xs"
              style={{ backgroundColor: selectedVariant.colorHex || '#681825' }}
            />
            <span className="text-xs text-stone-500 font-mono">SKU: {selectedVariant.sku}</span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-xs font-semibold text-stone-900">Quantity</span>
          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="px-3 py-1.5 text-stone-700 hover:bg-stone-200 disabled:opacity-40 rounded-l-lg transition-colors font-bold"
            >
              -
            </button>
            <span className="px-3 py-1.5 text-xs font-semibold tabular-nums text-stone-900 min-w-8 text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= selectedVariant.stock}
              className="px-3 py-1.5 text-stone-700 hover:bg-stone-200 disabled:opacity-40 rounded-r-lg transition-colors font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Description & Fabric Specifications */}
      <div className="p-4 bg-white mt-2 border-y border-stone-200/80">
        <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
          Artisanal Weave & Details
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-stone-400 block mb-0.5">Fabric Composition</span>
            <span className="font-semibold text-stone-800">{product.fabric}</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Embroidery & Weave</span>
            <span className="font-semibold text-stone-800">{product.craftType}</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Care Instructions</span>
            <span className="font-semibold text-stone-800">Dry Clean Only</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-0.5">Origin</span>
            <span className="font-semibold text-stone-800">Bangladesh Heritage</span>
          </div>
        </div>
      </div>

      {/* Shipping & Delivery Info */}
      <div className="p-4 bg-white mt-2 border-y border-stone-200/80">
        <h3 className="font-editorial text-lg font-bold text-stone-900 mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#53121C]" />
          <span>Delivery Across Bangladesh</span>
        </h3>
        <div className="space-y-2 text-xs text-stone-600">
          <div className="flex justify-between pb-1.5 border-b border-stone-100">
            <span>Inside Dhaka (2-3 Business Days)</span>
            <span className="font-semibold text-stone-900 font-mono">৳70</span>
          </div>
          <div className="flex justify-between pb-1.5 border-b border-stone-100">
            <span>Outside Dhaka - 64 Districts (3-5 Days)</span>
            <span className="font-semibold text-stone-900 font-mono">৳130</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span>Cash on Delivery available on all orders nationwide.</span>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="p-4 mt-2">
          <h3 className="font-editorial text-xl font-bold text-stone-900 mb-3">
            More from this Collection
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
                onAddToCart={(prod) => onAddToCart(prod)}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-stone-200 p-3 max-w-md mx-auto shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Price</span>
            <span className="text-lg font-bold text-stone-900 tabular-nums">
              ৳{(product.price * quantity).toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product, selectedVariant.id, quantity)}
            disabled={selectedVariant.stock <= 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#53121C] hover:bg-[#681825] disabled:bg-stone-300 text-white text-xs font-semibold tracking-wide rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{selectedVariant.stock > 0 ? 'Add to Shopping Bag' : 'Sold Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
