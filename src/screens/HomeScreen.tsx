import React from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ScreenName } from '../store/useStore';
import { Search, Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Copy, Check } from 'lucide-react';
import { SEED_CATEGORIES } from '../lib/seedData';

interface HomeScreenProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  onNavigate: (screen: ScreenName) => void;
  onSelectCategory: (categoryId: string) => void;
  onShowToast: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onNavigate,
  onSelectCategory,
  onShowToast,
}) => {
  const [copiedCode, setCopiedCode] = React.useState(false);

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('NAKSHI10');
    setCopiedCode(true);
    onShowToast('Coupon code "NAKSHI10" copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="pb-24 bg-[#FDFBF7] min-h-screen">
      {/* Top Search Bar */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => onNavigate('search')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-stone-200/90 rounded-xl text-stone-500 shadow-xs hover:border-[#C5A059] transition-colors text-xs"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400" />
            <span>Search Dhakai Jamdani, Salwar Suits, Kurtis...</span>
          </span>
          <span className="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded font-medium">
            Search
          </span>
        </button>
      </div>

      {/* Hero Campaign Banner */}
      <div className="px-4 pt-1 pb-4">
        <div className="relative rounded-2xl overflow-hidden aspect-16/10 sm:aspect-16/8 bg-stone-900 shadow-md">
          <img
            src="/src/assets/images/hero_jamdani_saree_1792493300704.jpg"
            alt="Royal Jamdani Edition"
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
            <span className="bg-[#53121C] text-[#E2CFAB] text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-sm w-fit mb-2">
              Heritage Weaves 2026
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight">
              The Royal Jamdani Edition
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 line-clamp-2 max-w-md">
              Hand-woven Dhakai Muslin & Mirpur Katan Sarees with opulent gold zari motifs.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onSelectCategory('sarees');
                  onNavigate('catalog');
                }}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#d8b56d] text-stone-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Explore Sarees</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Carousel */}
      <div className="py-2">
        <div className="px-4 flex items-center justify-between mb-2.5">
          <h2 className="font-editorial text-xl font-bold text-stone-900">
            Curated Collections
          </h2>
          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigate('catalog');
            }}
            className="text-xs font-semibold text-[#53121C] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-1">
          {SEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('catalog');
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg border border-stone-200/90 hover:border-[#53121C] whitespace-nowrap text-xs font-medium text-stone-800 shadow-2xs transition-colors shrink-0"
            >
              <span>{cat.name}</span>
              <span className="text-[10px] text-stone-400 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Promotional Coupon Strip */}
      <div className="px-4 my-4">
        <div className="p-3.5 bg-gradient-to-r from-[#53121C] to-[#681825] rounded-xl text-white flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E2CFAB] tracking-wide">FESTIVE PRIVILEGE</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">10% OFF</span>
              </div>
              <p className="text-[11px] text-stone-200 mt-0.5">Use code on orders above ৳4,000</p>
            </div>
          </div>
          <button
            onClick={handleCopyCoupon}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C5A059] text-stone-900 rounded-md text-xs font-bold shadow-xs hover:bg-[#d8b56d] transition-colors shrink-0"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono">{copiedCode ? 'COPIED' : 'NAKSHI10'}</span>
          </button>
        </div>
      </div>

      {/* New Arrivals Section */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              New Arrivals
            </h2>
            <p className="text-xs text-stone-500">Fresh weaves crafted for festive gatherings</p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigate('catalog');
            }}
            className="text-xs font-medium text-[#53121C] hover:underline"
          >
            Browse
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="px-4 py-4 mt-2 bg-[#FAF7F2] border-y border-stone-200/70">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900">
              Most Coveted
            </h2>
            <p className="text-xs text-stone-500">Loved by Nakshi boutique connoisseurs</p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('all');
              onNavigate('catalog');
            }}
            className="text-xs font-medium text-[#53121C] hover:underline"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      </div>

      {/* Boutique Trust Pillars */}
      <div className="px-4 py-6">
        <h3 className="font-editorial text-xl font-bold text-stone-900 mb-3 text-center">
          The Nakshi Promise
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-white rounded-xl border border-stone-200/80">
            <Truck className="w-5 h-5 text-[#53121C] mx-auto mb-1.5" />
            <div className="text-[11px] font-semibold text-stone-800">Nationwide</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Dhaka & 64 Districts</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200/80">
            <ShieldCheck className="w-5 h-5 text-[#C5A059] mx-auto mb-1.5" />
            <div className="text-[11px] font-semibold text-stone-800">Cash on Delivery</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Pay at your doorstep</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-stone-200/80">
            <RotateCcw className="w-5 h-5 text-[#53121C] mx-auto mb-1.5" />
            <div className="text-[11px] font-semibold text-stone-800">Authentic Handloom</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Certified artisans</div>
          </div>
        </div>
      </div>
    </div>
  );
};
