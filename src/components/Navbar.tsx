import React from 'react';
import { ScreenName } from '../store/useStore';
import { Search, Heart, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  cartCount: number;
  wishlistCount: number;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  cartCount,
  wishlistCount,
  isAdmin,
  onToggleAdmin,
}) => {
  const isRootScreen = ['home', 'catalog', 'wishlist', 'orders', 'profile'].includes(currentScreen);

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back button or Brand Title */}
        <div className="flex items-center gap-2">
          {!isRootScreen && currentScreen !== 'admin' ? (
            <button
              onClick={() => onNavigate('home')}
              className="p-1.5 -ml-1 text-stone-700 hover:text-[#681825] hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          <button
            onClick={() => onNavigate('home')}
            className="text-left group flex items-baseline gap-1.5"
          >
            <span className="font-editorial text-2xl font-bold tracking-tight text-[#53121C]">
              Nakshi
            </span>
            <span className="font-editorial text-xl italic font-normal text-stone-600">
              Closet
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A059] mb-1" />
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Admin toggle icon */}
          <button
            onClick={onToggleAdmin}
            title={isAdmin ? "Switch to Customer View" : "Open Admin Portal"}
            className={`p-2 rounded-full transition-colors flex items-center gap-1 text-xs font-medium ${
              isAdmin 
                ? 'bg-[#53121C] text-white shadow-sm' 
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Staff'}</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => onNavigate('search')}
            aria-label="Search products"
            className={`p-2 rounded-full transition-colors ${
              currentScreen === 'search'
                ? 'text-[#53121C] bg-[#53121C]/10'
                : 'text-stone-700 hover:text-[#53121C] hover:bg-stone-100'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={() => onNavigate('wishlist')}
            aria-label="Wishlist"
            className="p-2 relative rounded-full text-stone-700 hover:text-[#53121C] hover:bg-stone-100 transition-colors"
          >
            <Heart className={`w-5 h-5 ${currentScreen === 'wishlist' ? 'fill-[#53121C] text-[#53121C]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C5A059] text-[10px] font-semibold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Trigger */}
          <button
            onClick={() => onNavigate('cart')}
            aria-label="Shopping Cart"
            className="p-2 relative rounded-full text-[#53121C] hover:bg-[#53121C]/10 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#53121C] text-[10px] font-semibold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
