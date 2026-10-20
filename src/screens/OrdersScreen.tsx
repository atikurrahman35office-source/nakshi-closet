import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { dbService } from '../lib/supabase';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface OrdersScreenProps {
  orders: Order[];
  onRefreshOrders: () => void;
  onNavigate: (screen: ScreenName) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  orders,
  onRefreshOrders,
  onNavigate,
  onShowToast,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const handleCancelOrder = async (order: Order) => {
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      onShowToast('This order has already been dispatched and cannot be cancelled.', 'error');
      return;
    }

    const confirmed = window.confirm(`Are you sure you wish to cancel Order ${order.orderNumber}?`);
    if (!confirmed) return;

    setCancellingOrderId(order.id);
    try {
      const success = await dbService.updateOrderStatus(order.id, 'cancelled', 'Cancelled by customer.');
      if (success) {
        onShowToast(`Order ${order.orderNumber} has been cancelled.`, 'info');
        onRefreshOrders();
      } else {
        onShowToast('Failed to cancel order.', 'error');
      }
    } catch {
      onShowToast('Error updating order.', 'error');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">Tailoring/Prep</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">On The Way</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="pb-24 bg-[#FDFBF7] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-stone-800">
          No Orders Yet
        </h2>
        <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
          You haven't placed any boutique orders yet. Browse our exquisite collection and place your first order.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="mt-6 px-6 py-3 bg-[#53121C] hover:bg-[#681825] text-white rounded-xl text-xs font-semibold tracking-wide shadow-md transition-all"
        >
          Browse Sarees & Dresses
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-[#FDFBF7] min-h-screen">
      {/* Top Header */}
      <div className="sticky top-[53px] z-20 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-editorial text-2xl font-bold text-stone-900">
            My Orders ({orders.length})
          </h1>
          <button
            onClick={onRefreshOrders}
            className="text-xs font-semibold text-[#53121C] hover:underline"
          >
            Refresh
          </button>
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const canCancel = order.status === 'pending' || order.status === 'confirmed';

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden transition-all"
            >
              {/* Order Card Header */}
              <div
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="p-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-stone-900">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>{order.items.length} item(s)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 tabular-nums">
                      ৳{order.totalAmount.toLocaleString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details and Timeline */}
              {isExpanded && (
                <div className="p-4 border-t border-stone-100 bg-stone-50/40 text-xs space-y-4 animate-in fade-in duration-200">
                  {/* Status Timeline */}
                  <div>
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-2">
                      Tracking Progress
                    </h4>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {[
                        { label: 'Placed', active: true },
                        { label: 'Confirmed', active: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
                        { label: 'Shipped', active: ['shipped', 'delivered'].includes(order.status) },
                        { label: 'Delivered', active: order.status === 'delivered' },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                              order.status === 'cancelled'
                                ? 'bg-stone-200 text-stone-400'
                                : step.active
                                ? 'bg-[#53121C] text-white'
                                : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span className={`text-[10px] ${step.active ? 'font-semibold text-stone-900' : 'text-stone-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items Snapshot */}
                  <div>
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-2">
                      Garments in Order
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-stone-200/80">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-12 object-cover rounded bg-stone-100"
                            />
                            <div>
                              <p className="font-semibold text-stone-900 line-clamp-1">{item.productName}</p>
                              <p className="text-[11px] text-stone-500">
                                Variant: {item.size} · {item.color} · Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-stone-900">
                            ৳{item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-white p-3 rounded-lg border border-stone-200/80">
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px] mb-1">
                      Delivery Destination
                    </h4>
                    <p className="font-medium text-stone-900">{order.customerName} ({order.customerPhone})</p>
                    <p className="text-stone-600 mt-0.5">{order.deliveryAddress}</p>
                    <p className="text-stone-500 mt-0.5 font-medium">District: {order.district}</p>
                  </div>

                  {/* Cancel Button if eligible */}
                  {canCancel && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancellingOrderId === order.id}
                        className="w-full py-2 px-3 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel this Order</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
