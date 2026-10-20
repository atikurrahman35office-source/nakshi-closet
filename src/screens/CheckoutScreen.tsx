import React, { useState } from 'react';
import { CartItem, Coupon, Order, UserProfile } from '../types';
import { BANGLADESH_DISTRICTS } from '../lib/seedData';
import { dbService } from '../lib/supabase';
import { ArrowLeft, ShieldCheck, Truck, Lock, CreditCard } from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface CheckoutScreenProps {
  user: UserProfile;
  cart: CartItem[];
  cartSubtotal: number;
  shippingFee: number;
  discountAmount: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  selectedDistrict: string;
  onSelectDistrict: (d: string) => void;
  onOrderPlaced: (order: Order) => void;
  onClearCart: () => void;
  onBack: () => void;
  onNavigate: (screen: ScreenName) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  user,
  cart,
  cartSubtotal,
  shippingFee,
  discountAmount,
  grandTotal,
  appliedCoupon,
  selectedDistrict,
  onSelectDistrict,
  onOrderPlaced,
  onClearCart,
  onBack,
  onNavigate,
  onShowToast,
}) => {
  const [customerName, setCustomerName] = useState(user.name || '');
  const [customerPhone, setCustomerPhone] = useState(user.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user.defaultAddress || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'SSLCOMMERZ'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      onShowToast('Please provide your full recipient name.', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      onShowToast('Please enter a valid Bangladeshi contact phone number.', 'error');
      return;
    }
    if (!deliveryAddress.trim() || deliveryAddress.length < 5) {
      onShowToast('Please enter complete street and building address.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userId: user.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        district: selectedDistrict,
        division: selectedDistrict === 'Dhaka' ? 'Dhaka' : 'Bangladesh',
        deliveryAddress: deliveryAddress.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        couponCode: appliedCoupon?.code,
        paymentMethod: paymentMethod,
        cartItems: cart.map((item) => ({
          productId: item.productId,
          variantId: item.selectedVariant.id,
          quantity: item.quantity,
        })),
      };

      const result = await dbService.processCheckout(payload);

      if (!result.success || !result.order) {
        onShowToast(result.error || 'Checkout validation failed.', 'error');
        setIsSubmitting(false);
        return;
      }

      onClearCart();
      onOrderPlaced(result.order);
      onShowToast('Order placed successfully!', 'success');
      onNavigate('order-success');
    } catch (err: any) {
      onShowToast(err.message || 'An unexpected error occurred during checkout.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-36 bg-[#FDFBF7] min-h-screen">
      {/* Top Header */}
      <div className="sticky top-[53px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-[#53121C]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bag</span>
        </button>
        <span className="font-editorial text-lg font-bold text-stone-900">
          Secure Checkout
        </span>
        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmitOrder} className="p-4 space-y-4">
        {/* Recipient Details */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <span>1. Delivery Information</span>
          </h2>

          <div>
            <label className="text-xs text-stone-600 block mb-1">Full Recipient Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Samira Rahman"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-stone-600 block mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+880 1712..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
              />
            </div>
            <div>
              <label className="text-xs text-stone-600 block mb-1">Email Address</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="samira@example.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-600 block mb-1">District / Region *</label>
            <select
              value={selectedDistrict}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
            >
              {BANGLADESH_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist} {dist === 'Dhaka' ? '(Inside Dhaka - ৳70)' : '(Outside Dhaka - ৳130)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-stone-600 block mb-1">Street Address, Flat / House / Road *</label>
            <textarea
              required
              rows={2}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="e.g. House 42, Road 11, Block D, Banani, Dhaka-1213"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
            />
          </div>

          <div>
            <label className="text-xs text-stone-600 block mb-1">Delivery Instructions (Optional)</label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Ring bell twice, deliver after 2 PM"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            2. Payment Method
          </h2>

          <div className="space-y-2 text-xs">
            {/* Cash on Delivery */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'COD'
                  ? 'border-[#53121C] bg-rose-50/40 text-stone-900'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="mt-0.5 text-[#53121C] focus:ring-[#53121C]"
              />
              <div className="flex-1">
                <div className="font-semibold text-stone-900 flex items-center justify-between">
                  <span>Cash on Delivery (COD)</span>
                  <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Pay in cash when our trusted courier delivers your package to your doorstep.
                </p>
              </div>
            </label>

            {/* SSLCommerz Gateway Integration Architecture */}
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'SSLCOMMERZ'
                  ? 'border-[#53121C] bg-rose-50/40 text-stone-900'
                  : 'border-stone-200 text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'SSLCOMMERZ'}
                onChange={() => setPaymentMethod('SSLCOMMERZ')}
                className="mt-0.5 text-[#53121C] focus:ring-[#53121C]"
              />
              <div className="flex-1">
                <div className="font-semibold text-stone-900 flex items-center justify-between">
                  <span>Online Payment / bKash / Cards (SSLCommerz)</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Architected for SSLCommerz payment gateway in Bangladesh. Select COD for immediate order verification.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary Snapshot */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 pb-2 border-b border-stone-100">
            3. Order Review
          </h2>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-stone-600">
                <span className="truncate max-w-[200px]">
                  {item.product.name} ({item.selectedVariant.size}) × {item.quantity}
                </span>
                <span className="font-mono text-stone-900">
                  ৳{(item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-1.5 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-stone-900">৳{cartSubtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({appliedCoupon?.code})</span>
                <span className="font-mono">-৳{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee ({selectedDistrict})</span>
              <span className="font-mono text-stone-900">
                {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
              <span>Total Payable</span>
              <span className="text-[#53121C] font-mono text-base">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Security Trust Note */}
        <div className="flex items-center gap-2 text-[11px] text-stone-500 justify-center">
          <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>All orders are backed by Nakshi Closet's Authentic Weave Guarantee.</span>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#53121C] hover:bg-[#681825] disabled:bg-stone-400 text-white text-xs font-semibold tracking-wider uppercase rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Authorizing Order with Database...</span>
            ) : (
              <span>Confirm & Place Order (৳{grandTotal.toLocaleString()})</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
