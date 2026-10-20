import React from 'react';
import { Product } from '../types';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface WishlistScreenProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (id: string) => void;
  onNavigate: (screen: ScreenName) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  products,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onNavigate,
}) => {
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="pb-24 bg-[#FDFBF7] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-stone-800">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
          Tap the heart icon on any saree, salwar suit, or kurti to save it for your next celebration.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="mt-6 px-6 py-3 bg-[#53121C] hover:bg-[#681825] text-white rounded-xl text-xs font-semibold tracking-wide shadow-md transition-all"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-[#FDFBF7] min-h-screen">
      {/* Top Header */}
      <div className="sticky top-[53px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 p-4">
        <div className="flex justify-between items-center">
          <h1 className="font-editorial text-2xl font-bold text-stone-900">
            My Wishlist ({wishlistedProducts.length})
          </h1>
          <span className="text-xs text-stone-500">Saved Boutique Pieces</span>
        </div>
      </div>

      {/* Grid of Wishlisted Products */}
      <div className="p-4 grid grid-cols-2 gap-3 sm:gap-4">
        {wishlistedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product.id)}
            className="group flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden cursor-pointer shadow-xs"
          >
            <div className="relative aspect-3/4 bg-stone-100 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-700 shadow-sm"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">
                  {product.categoryName}
                </span>
                <h3 className="font-editorial text-sm font-semibold text-stone-900 line-clamp-1 mt-0.5">
                  {product.name}
                </h3>
                <div className="font-bold text-xs text-stone-900 mt-1 tabular-nums">
                  ৳{product.price.toLocaleString()}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                disabled={!product.inStock}
                className="mt-3 w-full py-2 bg-[#53121C] hover:bg-[#681825] disabled:bg-stone-200 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.inStock ? 'Move to Bag' : 'Sold Out'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
