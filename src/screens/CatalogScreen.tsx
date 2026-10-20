import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SEED_CATEGORIES } from '../lib/seedData';
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

interface CatalogScreenProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onSelectProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlist,
}) => {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(25000);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        if (onlyInStock && !p.inStock) {
          return false;
        }
        if (p.price > priceMax) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, onlyInStock, priceMax, sortBy]);

  return (
    <div className="pb-24 bg-[#FDFBF7] min-h-screen">
      {/* Category Tabs Header */}
      <div className="sticky top-[53px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {SEED_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#53121C] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Toolbar: Count, Filter toggle, Sort, Grid/List */}
        <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-stone-100 text-xs">
          <span className="text-stone-500 font-medium">
            <span className="font-semibold text-stone-900">{filteredProducts.length}</span> pieces found
          </span>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                isFilterOpen || onlyInStock || priceMax < 25000
                  ? 'border-[#53121C] text-[#53121C] bg-rose-50'
                  : 'border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-stone-200 text-stone-700 text-xs font-medium pl-2 pr-6 py-1 rounded-md cursor-pointer focus:outline-none focus:border-[#53121C]"
              >
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-stone-400 absolute right-1.5 pointer-events-none" />
            </div>

            {/* Layout Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-md border border-stone-200">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1 rounded ${layout === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'}`}
                aria-label="Grid layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-1 rounded ${layout === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400'}`}
                aria-label="List layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-stone-200 text-xs shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-semibold text-stone-900">
              <span>Filter Collection</span>
              <button onClick={() => setIsFilterOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-700 font-medium">In-Stock Only</span>
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#53121C] focus:ring-[#53121C] w-4 h-4 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>Max Price</span>
                  <span className="font-semibold text-stone-900">৳{priceMax.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="25000"
                  step="500"
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#53121C] cursor-pointer"
                />
              </div>

              {(onlyInStock || priceMax < 25000 || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setOnlyInStock(false);
                    setPriceMax(25000);
                    onSelectCategory('all');
                  }}
                  className="text-xs text-[#53121C] hover:underline font-medium text-left"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Catalog Grid or List */}
      <div className="px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-6">
            <SlidersHorizontal className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <h3 className="font-editorial text-xl font-bold text-stone-800">
              No matching pieces found
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Try adjusting your price range or switching categories to explore other boutique pieces.
            </p>
            <button
              onClick={() => {
                onSelectCategory('all');
                setOnlyInStock(false);
                setPriceMax(25000);
              }}
              className="mt-4 px-4 py-2 bg-[#53121C] text-white rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout={layout}
                onSelect={onSelectProduct}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
