import React from 'react';
import { Product } from '../types';
import { Heart, ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  layout = 'grid',
}) => {
  if (layout === 'list') {
    return (
      <div 
        onClick={() => onSelect(product.id)}
        className="group flex gap-4 p-3 bg-white rounded-xl border border-stone-200/80 hover:border-[#C5A059]/60 transition-all cursor-pointer shadow-xs"
      >
        <div className="relative w-28 h-36 shrink-0 rounded-lg overflow-hidden bg-stone-100">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discountPercent ? (
            <span className="absolute top-1.5 left-1.5 bg-[#53121C] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm">
              -{product.discountPercent}%
            </span>
          ) : null}
        </div>

        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>{product.categoryName}</span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {product.rating}
              </span>
            </div>
            <h3 className="font-editorial text-lg font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#53121C] transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-stone-500 mt-1 line-clamp-1">{product.fabric}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-stone-900 text-base tabular-nums">
                  ৳{product.price.toLocaleString()}
                </span>
                {product.originalPrice ? (
                  <span className="text-xs text-stone-400 line-through tabular-nums">
                    ৳{product.originalPrice.toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-2 rounded-full border transition-colors ${
                  isWishlisted
                    ? 'border-[#53121C] text-[#53121C] bg-rose-50'
                    : 'border-stone-200 text-stone-500 hover:text-stone-900'
                }`}
                aria-label="Save to wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#53121C]' : ''}`} />
              </button>
              <button
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#53121C] hover:bg-[#681825] disabled:bg-stone-300 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.inStock ? 'Add' : 'Sold Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(product.id)}
      className="group flex flex-col bg-white rounded-xl border border-stone-200/80 hover:border-[#C5A059]/60 overflow-hidden transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-3/4 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.discountPercent ? (
            <span className="bg-[#53121C] text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-sm shadow-xs">
              {product.discountPercent}% OFF
            </span>
          ) : null}
          {product.isNewArrival && (
            <span className="bg-[#C5A059] text-stone-900 text-[10px] font-semibold px-2 py-0.5 rounded-sm shadow-xs">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
            isWishlisted
              ? 'bg-white/95 text-[#53121C]'
              : 'bg-white/80 text-stone-700 hover:bg-white hover:text-[#53121C]'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-[#53121C]' : ''}`} />
        </button>

        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 text-stone-900 text-xs font-semibold px-3 py-1 rounded tracking-wider uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-medium">{product.categoryName}</span>
            <span className="flex items-center gap-0.5 text-amber-700">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="tabular-nums font-medium">{product.rating}</span>
            </span>
          </div>

          <h3 className="font-editorial text-base font-semibold text-stone-900 leading-snug line-clamp-2 group-hover:text-[#53121C] transition-colors">
            {product.name}
          </h3>

          <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{product.fabric}</p>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-stone-900 text-sm tabular-nums">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice ? (
                <span className="text-[11px] text-stone-400 line-through tabular-nums">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className="p-2 rounded-lg bg-[#53121C] hover:bg-[#681825] disabled:bg-stone-200 text-white transition-colors"
            title="Quick add to bag"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
