import React, { useState } from 'react';
import { CartItem, Coupon } from '../types';
import { Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface CartScreenProps {
  cart: CartItem[];
  onUpdateQty: (cartItemId: string, qty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  cartSubtotal: number;
  shippingFee: number;
  discountAmount: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  onNavigate: (screen: ScreenName) => void;
  onSelectProduct: (id: string) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  onUpdateQty,
  onRemoveItem,
  cartSubtotal,
  shippingFee,
  discountAmount,
  grandTotal,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  selectedDistrict,
  onSelectDistrict,
  onNavigate,
  onSelectProduct,
}) => {
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pb-24 bg-[#FDFBF7] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-stone-800">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
          Explore our handcrafted Dhakai Jamdani sarees, festive salwar suits, and designer kurtis.
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
    <div className="pb-36 bg-[#FDFBF7] min-h-screen">
      {/* Header Summary */}
      <div className="p-4 bg-white border-b border-stone-200">
        <div className="flex justify-between items-center">
          <h1 className="font-editorial text-2xl font-bold text-stone-900">
            Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </h1>
          <span className="text-xs text-stone-500 font-mono">
            Subtotal: ৳{cartSubtotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="p-4 divide-y divide-stone-200/80 bg-white border-b border-stone-200">
        {cart.map((item) => (
          <div key={item.id} className="py-4 first:pt-1 last:pb-1 flex gap-3.5">
            {/* Thumbnail */}
            <div
              onClick={() => onSelectProduct(item.productId)}
              className="w-20 h-24 rounded-lg bg-stone-100 overflow-hidden shrink-0 cursor-pointer"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3
                    onClick={() => onSelectProduct(item.productId)}
                    className="font-editorial text-base font-semibold text-stone-900 line-clamp-1 cursor-pointer hover:text-[#53121C]"
                  >
                    {item.product.name}
                  </h3>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-stone-400 hover:text-rose-700 p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                  <span>Size: <strong className="text-stone-700">{item.selectedVariant.size}</strong></span>
                  <span>·</span>
                  <span>Color: <strong className="text-stone-700">{item.selectedVariant.color}</strong></span>
                </div>
              </div>

              {/* Price & Quantity stepper */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-stone-900 text-sm tabular-nums">
                  ৳{(item.unitPrice * item.quantity).toLocaleString()}
                </span>

                <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                  <button
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="px-2 py-1 text-stone-600 hover:bg-stone-200 rounded-l transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 py-1 text-xs font-semibold tabular-nums text-stone-900 min-w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="px-2 py-1 text-stone-600 hover:bg-stone-200 rounded-r transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Application Module */}
      <div className="p-4 bg-white mt-2 border-y border-stone-200">
        <label className="text-xs font-semibold text-stone-900 block mb-2 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#53121C]" />
          <span>Boutique Privilege Coupon</span>
        </label>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-rose-50 border border-[#53121C]/20 rounded-xl">
            <div>
              <span className="text-xs font-bold text-[#53121C] font-mono tracking-wide">
                {appliedCoupon.code}
              </span>
              <p className="text-[11px] text-stone-600 mt-0.5">{appliedCoupon.description}</p>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-xs text-[#53121C] hover:underline font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="e.g. NAKSHI10"
              className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#53121C]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-[#53121C] text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Delivery Region Selection for Accurate Shipping */}
      <div className="p-4 bg-white mt-2 border-y border-stone-200">
        <span className="text-xs font-semibold text-stone-900 block mb-2">
          Destination Shipping Estimate
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => onSelectDistrict('Dhaka')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedDistrict.toLowerCase() === 'dhaka'
                ? 'border-[#53121C] bg-rose-50/50 text-[#53121C]'
                : 'border-stone-200 text-stone-700'
            }`}
          >
            <div className="font-semibold">Inside Dhaka</div>
            <div className="text-[11px] text-stone-500 mt-0.5">৳70 (2-3 Days)</div>
          </button>
          <button
            onClick={() => onSelectDistrict('Chittagong')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedDistrict.toLowerCase() !== 'dhaka'
                ? 'border-[#53121C] bg-rose-50/50 text-[#53121C]'
                : 'border-stone-200 text-stone-700'
            }`}
          >
            <div className="font-semibold">Outside Dhaka</div>
            <div className="text-[11px] text-stone-500 mt-0.5">৳130 (64 Districts)</div>
          </button>
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="p-4 bg-white mt-2 border-y border-stone-200 text-xs space-y-2">
        <div className="flex justify-between text-stone-600">
          <span>Bag Subtotal</span>
          <span className="font-medium text-stone-900 tabular-nums">
            ৳{cartSubtotal.toLocaleString()}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Privilege Discount ({appliedCoupon?.code})</span>
            <span className="font-medium tabular-nums">-৳{discountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between text-stone-600">
          <span>Estimated Delivery</span>
          <span className="font-medium text-stone-900 tabular-nums">
            {shippingFee === 0 ? 'FREE' : `৳${shippingFee}`}
          </span>
        </div>

        <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
          <span>Final Total</span>
          <span className="text-base text-[#53121C] tabular-nums">
            ৳{grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sticky Bottom Checkout Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-stone-200 p-3 max-w-md mx-auto shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Total Payable</span>
            <span className="text-lg font-bold text-[#53121C] tabular-nums">
              ৳{grandTotal.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#53121C] hover:bg-[#681825] text-white text-xs font-semibold tracking-wide rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
