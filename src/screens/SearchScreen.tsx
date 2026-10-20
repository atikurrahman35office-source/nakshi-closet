import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { SEED_CATEGORIES } from '../lib/seedData';

interface SearchScreenProps {
  products: Product[];
  recentSearches: string[];
  onAddRecentSearch: (term: string) => void;
  onClearRecentSearches: () => void;
  onSelectProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  products,
  recentSearches,
  onAddRecentSearch,
  onClearRecentSearches,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlist,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.craftType.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onAddRecentSearch(searchTerm.trim());
    }
  };

  const handleSelectRecent = (term: string) => {
    setSearchTerm(term);
    onAddRecentSearch(term);
  };

  return (
    <div className="pb-24 bg-[#FDFBF7] min-h-screen">
      {/* Top Search Input Header */}
      <div className="sticky top-[53px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Jamdani, Salwar Kameez, Silk..."
            autoFocus
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#53121C] shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Quick category pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
          {SEED_CATEGORIES.slice(1).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSearchTerm(cat.name);
                onAddRecentSearch(cat.name);
              }}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* If no search typed yet, show recent searches & suggested tags */}
        {!searchTerm ? (
          <div>
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Recent Searches</span>
                  </span>
                  <button
                    onClick={onClearRecentSearches}
                    className="text-stone-500 hover:text-[#53121C]"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectRecent(term)}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-700 hover:border-[#C5A059] flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{term}</span>
                      <ArrowRight className="w-3 h-3 text-stone-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Curations */}
            <div>
              <h3 className="font-editorial text-lg font-bold text-stone-900 mb-2">
                Popular Collections
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { title: 'Dhakai Jamdani Sarees', query: 'Jamdani' },
                  { title: 'Mirpur Silk Katan', query: 'Katan' },
                  { title: 'Embroidered Salwar Kameez', query: 'Salwar' },
                  { title: 'Muslin Kurtis', query: 'Muslin' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchTerm(item.query);
                      onAddRecentSearch(item.query);
                    }}
                    className="p-3 bg-white border border-stone-200 rounded-xl text-left hover:border-[#53121C] transition-colors shadow-xs"
                  >
                    <span className="font-semibold text-stone-900 block">{item.title}</span>
                    <span className="text-[10px] text-stone-400 mt-1 block">Tap to search</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search results */
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-3">
              <span>
                Found <strong className="text-stone-900">{searchResults.length}</strong> matching pieces
              </span>
              <span>for "{searchTerm}"</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-6">
                <Search className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h3 className="font-editorial text-xl font-bold text-stone-800">
                  No matching designs found
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  We couldn't find items matching "{searchTerm}". Try searching for Jamdani, Silk, Kurti, or Saree.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-[#53121C] text-white rounded-lg text-xs font-semibold"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {searchResults.map((product) => (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};
