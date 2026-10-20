import React from 'react';
import { Order } from '../types';
import { CheckCircle2, Package, ArrowRight, Copy, Check, Clock } from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface OrderSuccessProps {
  order: Order | null;
  onNavigate: (screen: ScreenName) => void;
  onShowToast: (msg: string) => void;
}

export const OrderSuccessScreen: React.FC<OrderSuccessProps> = ({
  order,
  onNavigate,
  onShowToast,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col justify-center items-center bg-[#FDFBF7]">
        <Package className="w-12 h-12 text-stone-400 mb-3" />
        <h2 className="font-editorial text-2xl font-bold text-stone-900">Order Placed</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-4 py-2 bg-[#53121C] text-white rounded-lg text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handleCopyOrderId = () => {
    navigator.clipboard?.writeText(order.orderNumber);
    setCopied(true);
    onShowToast(`Order ID ${order.orderNumber} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pb-24 bg-[#FDFBF7] min-h-screen p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-[#53121C] p-6 text-center text-white">
          <div className="w-14 h-14 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-[#E2CFAB]" />
          </div>
          <h1 className="font-editorial text-2xl font-bold tracking-tight">
            Dhanyabad! Order Placed
          </h1>
          <p className="text-stone-300 text-xs mt-1">
            Thank you for shopping with Nakshi Closet.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <span className="text-stone-300">Order ID:</span>
            <span className="font-mono font-bold text-[#E2CFAB]">{order.orderNumber}</span>
            <button
              onClick={handleCopyOrderId}
              className="p-1 text-stone-300 hover:text-white transition-colors"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="p-4 border-b border-stone-200">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-semibold text-stone-900">Current Status</span>
            <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200/60">
            <Clock className="w-4 h-4 text-[#53121C] shrink-0" />
            <p className="leading-snug">
              Our boutique concierge is verifying your garments. You will receive an SMS confirmation before courier dispatch.
            </p>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-4 border-b border-stone-200 text-xs space-y-1.5">
          <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-2">
            Delivery Destination
          </h3>
          <p className="text-stone-900 font-semibold">{order.customerName} ({order.customerPhone})</p>
          <p className="text-stone-600 leading-relaxed">{order.deliveryAddress}</p>
          <p className="text-stone-500 font-medium">District: {order.district}</p>
          <div className="pt-2 text-stone-700">
            Payment: <strong className="text-stone-900">{order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}</strong>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-4 border-b border-stone-200 text-xs">
          <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-2">
            Items Ordered ({order.items.length})
          </h3>
          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-12 rounded bg-stone-100 overflow-hidden shrink-0">
                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 line-clamp-1">{item.productName}</h4>
                    <p className="text-[11px] text-stone-500">
                      {item.size} · {item.color} · Qty {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-semibold text-stone-900 shrink-0">
                  ৳{item.subtotal.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-between font-bold text-sm text-stone-900">
            <span>Payable Amount:</span>
            <span className="text-[#53121C] font-mono">৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-stone-50 flex gap-2">
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 py-2.5 px-3 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-semibold rounded-xl text-center shadow-2xs"
          >
            Track in Orders
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 py-2.5 px-3 bg-[#53121C] hover:bg-[#681825] text-white text-xs font-semibold rounded-xl text-center shadow-xs flex items-center justify-center gap-1"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
