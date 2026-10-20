import React from 'react';
import { ScreenName } from '../store/useStore';
import { Home, LayoutGrid, Heart, Package, User } from 'lucide-react';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  wishlistCount: number;
  ordersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  wishlistCount,
}) => {
  const tabs: { id: ScreenName; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalog', label: 'Collection', icon: LayoutGrid },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-stone-200/90 py-1.5 px-3 max-w-md mx-auto transition-all">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 relative rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#53121C] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'wishlist' && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#C5A059] text-[9px] text-white flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-[#53121C]' : 'text-stone-600'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#53121C] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
