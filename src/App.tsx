import React from 'react';
import { useNakshiStore } from './store/useStore';
import { AndroidFrame } from './components/AndroidFrame';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { DownloadAppModal } from './components/DownloadAppModal';

import { SplashScreen, OnboardingScreen } from './screens/SplashScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { SearchScreen } from './screens/SearchScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { OrderSuccessScreen } from './screens/OrderSuccessScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { WishlistScreen } from './screens/WishlistScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminDashboard } from './screens/AdminDashboard';

export default function App() {
  const store = useNakshiStore();

  const handleSelectProduct = (productId: string) => {
    store.setSelectedProductId(productId);
    store.setCurrentScreen('details');
  };

  const isFullscreenWelcome = store.currentScreen === 'splash' || store.currentScreen === 'onboarding';
  const isBottomNavVisible = ['home', 'catalog', 'wishlist', 'orders', 'profile'].includes(store.currentScreen);

  // If in splash or onboarding
  if (store.currentScreen === 'splash') {
    return (
      <AndroidFrame
        deviceMode={store.deviceMode}
        onToggleDeviceMode={() => store.setDeviceMode(store.deviceMode === 'mobile' ? 'responsive' : 'mobile')}
        isAdmin={store.user.role === 'admin'}
        onToggleAdmin={store.toggleRole}
        onOpenSupabaseModal={() => store.setIsSupabaseModalOpen(true)}
        isSupabaseConnected={store.supabaseConfig.isConnected}
      >
        <SplashScreen onFinishSplash={() => store.setCurrentScreen('onboarding')} />
      </AndroidFrame>
    );
  }

  if (store.currentScreen === 'onboarding') {
    return (
      <AndroidFrame
        deviceMode={store.deviceMode}
        onToggleDeviceMode={() => store.setDeviceMode(store.deviceMode === 'mobile' ? 'responsive' : 'mobile')}
        isAdmin={store.user.role === 'admin'}
        onToggleAdmin={store.toggleRole}
        onOpenSupabaseModal={() => store.setIsSupabaseModalOpen(true)}
        isSupabaseConnected={store.supabaseConfig.isConnected}
      >
        <OnboardingScreen onComplete={() => store.setCurrentScreen('home')} />
      </AndroidFrame>
    );
  }

  const lastOrder = store.orders.find((o) => o.id === store.lastPlacedOrderId) || store.orders[0] || null;

  return (
    <AndroidFrame
      deviceMode={store.deviceMode}
      onToggleDeviceMode={() => store.setDeviceMode(store.deviceMode === 'mobile' ? 'responsive' : 'mobile')}
      isAdmin={store.user.role === 'admin'}
      onToggleAdmin={() => {
        if (store.currentScreen === 'admin') {
          store.setCurrentScreen('home');
        } else {
          store.setCurrentScreen('admin');
        }
      }}
      onOpenSupabaseModal={() => store.setIsSupabaseModalOpen(true)}
      isSupabaseConnected={store.supabaseConfig.isConnected}
      onOpenDownloadModal={() => store.setIsDownloadModalOpen(true)}
    >
      <div className="min-h-full flex flex-col bg-[#FDFBF7] text-stone-900 relative">
        {/* Top Navbar */}
        {store.currentScreen !== 'admin' && (
          <Navbar
            currentScreen={store.currentScreen}
            onNavigate={store.setCurrentScreen}
            cartCount={store.cart.reduce((sum, item) => sum + item.quantity, 0)}
            wishlistCount={store.wishlist.length}
            isAdmin={store.user.role === 'admin'}
            onToggleAdmin={() => store.setCurrentScreen('admin')}
          />
        )}

        {/* Dynamic Screen Viewport */}
        <main className="flex-1">
          {store.currentScreen === 'home' && (
            <HomeScreen
              products={store.products}
              onSelectProduct={handleSelectProduct}
              onAddToCart={store.addToCart}
              onToggleWishlist={store.toggleWishlist}
              wishlist={store.wishlist}
              onNavigate={store.setCurrentScreen}
              onSelectCategory={store.setSelectedCategory}
              onShowToast={store.showToast}
            />
          )}

          {store.currentScreen === 'catalog' && (
            <CatalogScreen
              products={store.products}
              selectedCategory={store.selectedCategory}
              onSelectCategory={store.setSelectedCategory}
              onSelectProduct={handleSelectProduct}
              onAddToCart={store.addToCart}
              onToggleWishlist={store.toggleWishlist}
              wishlist={store.wishlist}
            />
          )}

          {store.currentScreen === 'details' && store.selectedProductId && (
            <ProductDetailScreen
              productId={store.selectedProductId}
              products={store.products}
              onBack={() => store.setCurrentScreen('catalog')}
              onAddToCart={store.addToCart}
              onToggleWishlist={store.toggleWishlist}
              isWishlisted={store.wishlist.includes(store.selectedProductId)}
              onSelectProduct={handleSelectProduct}
              wishlist={store.wishlist}
            />
          )}

          {store.currentScreen === 'search' && (
            <SearchScreen
              products={store.products}
              recentSearches={store.recentSearches}
              onAddRecentSearch={store.addRecentSearch}
              onClearRecentSearches={store.clearRecentSearches}
              onSelectProduct={handleSelectProduct}
              onAddToCart={store.addToCart}
              onToggleWishlist={store.toggleWishlist}
              wishlist={store.wishlist}
            />
          )}

          {store.currentScreen === 'cart' && (
            <CartScreen
              cart={store.cart}
              onUpdateQty={store.updateCartQty}
              onRemoveItem={store.removeFromCart}
              onClearCart={store.clearCart}
              cartSubtotal={store.cartSubtotal}
              shippingFee={store.shippingFee}
              discountAmount={store.discountAmount}
              grandTotal={store.grandTotal}
              appliedCoupon={store.appliedCoupon}
              onApplyCoupon={store.applyCouponCode}
              onRemoveCoupon={store.removeCoupon}
              selectedDistrict={store.selectedDistrict}
              onSelectDistrict={store.setSelectedDistrict}
              onNavigate={store.setCurrentScreen}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {store.currentScreen === 'checkout' && (
            <CheckoutScreen
              user={store.user}
              cart={store.cart}
              cartSubtotal={store.cartSubtotal}
              shippingFee={store.shippingFee}
              discountAmount={store.discountAmount}
              grandTotal={store.grandTotal}
              appliedCoupon={store.appliedCoupon}
              selectedDistrict={store.selectedDistrict}
              onSelectDistrict={store.setSelectedDistrict}
              onOrderPlaced={(newOrder) => {
                store.setLastPlacedOrderId(newOrder.id);
                store.refreshOrders();
              }}
              onClearCart={store.clearCart}
              onBack={() => store.setCurrentScreen('cart')}
              onNavigate={store.setCurrentScreen}
              onShowToast={store.showToast}
            />
          )}

          {store.currentScreen === 'order-success' && (
            <OrderSuccessScreen
              order={lastOrder}
              onNavigate={store.setCurrentScreen}
              onShowToast={store.showToast}
            />
          )}

          {store.currentScreen === 'orders' && (
            <OrdersScreen
              orders={store.orders}
              onRefreshOrders={store.refreshOrders}
              onNavigate={store.setCurrentScreen}
              onShowToast={store.showToast}
            />
          )}

          {store.currentScreen === 'wishlist' && (
            <WishlistScreen
              products={store.products}
              wishlist={store.wishlist}
              onToggleWishlist={store.toggleWishlist}
              onAddToCart={store.addToCart}
              onSelectProduct={handleSelectProduct}
              onNavigate={store.setCurrentScreen}
            />
          )}

          {store.currentScreen === 'profile' && (
            <ProfileScreen
              user={store.user}
              onUpdateUser={(updated) => store.setUser((prev) => ({ ...prev, ...updated }))}
              onToggleRole={store.toggleRole}
              onNavigate={store.setCurrentScreen}
              onOpenSupabaseModal={() => store.setIsSupabaseModalOpen(true)}
              onOpenDownloadModal={() => store.setIsDownloadModalOpen(true)}
              isSupabaseConnected={store.supabaseConfig.isConnected}
              onShowToast={store.showToast}
            />
          )}

          {store.currentScreen === 'admin' && (
            <AdminDashboard
              products={store.products}
              orders={store.orders}
              storeSettings={store.storeSettings}
              onRefreshProducts={store.refreshProducts}
              onRefreshOrders={store.refreshOrders}
              onNavigate={store.setCurrentScreen}
              onShowToast={store.showToast}
            />
          )}
        </main>

        {/* Bottom Navigation for Root Customer Screens */}
        {isBottomNavVisible && (
          <BottomNav
            currentScreen={store.currentScreen}
            onNavigate={store.setCurrentScreen}
            wishlistCount={store.wishlist.length}
            ordersCount={store.orders.length}
          />
        )}

        {/* Global Toast Notifications */}
        <ToastContainer toasts={store.toasts} />

        {/* Supabase Connection & Schema Modal */}
        <SupabaseConfigModal
          isOpen={store.isSupabaseModalOpen}
          onClose={() => store.setIsSupabaseModalOpen(false)}
          config={store.supabaseConfig}
          onSave={store.saveSupabaseKeys}
        />

        {/* Download App & Installation Modal */}
        <DownloadAppModal
          isOpen={store.isDownloadModalOpen}
          onClose={() => store.setIsDownloadModalOpen(false)}
          appUrl={window.location.href}
        />
      </div>
    </AndroidFrame>
  );
}
