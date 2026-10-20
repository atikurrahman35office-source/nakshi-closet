import React, { useState } from 'react';
import { Product, Order, Coupon, StoreSettings, OrderStatus } from '../types';
import { dbService } from '../lib/supabase';
import { 
  Package, DollarSign, AlertTriangle, Tag, Plus, Edit2, Trash2, 
  CheckCircle, ArrowLeft, ShieldCheck, RefreshCw, X, Save 
} from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  storeSettings: StoreSettings;
  onRefreshProducts: () => void;
  onRefreshOrders: () => void;
  onNavigate: (screen: ScreenName) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  storeSettings,
  onRefreshProducts,
  onRefreshOrders,
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons' | 'settings'>('overview');
  
  // Product Edit / Create Modal state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(3000);

  // Settings local state
  const [shippingDhaka, setShippingDhaka] = useState(storeSettings.shippingDhaka);
  const [shippingOutside, setShippingOutside] = useState(storeSettings.shippingOutsideDhaka);

  // Load coupons on mount
  React.useEffect(() => {
    dbService.getCoupons().then(setCoupons);
  }, []);

  // Compute Metrics
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockProducts = products.filter((p) => p.totalStock <= 5);

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const success = await dbService.updateOrderStatus(orderId, newStatus, `Status updated by Admin to ${newStatus}`);
    if (success) {
      onShowToast(`Order updated to "${newStatus}"`, 'success');
      onRefreshOrders();
    } else {
      onShowToast('Could not update order status.', 'error');
    }
  };

  // Handle Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      onShowToast('Product name and price are required.', 'error');
      return;
    }

    try {
      await dbService.saveProduct(editingProduct as any);
      onShowToast('Product saved successfully!', 'success');
      setIsProductModalOpen(false);
      setEditingProduct(null);
      onRefreshProducts();
    } catch {
      onShowToast('Failed to save product.', 'error');
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const success = await dbService.deleteProduct(id);
    if (success) {
      onShowToast(`Deleted "${name}"`, 'info');
      onRefreshProducts();
    } else {
      onShowToast('Failed to delete product.', 'error');
    }
  };

  // Handle Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCoupon: Coupon = {
      id: 'cp-' + Date.now().toString(36),
      code: newCouponCode.trim().toUpperCase(),
      description: `${newCouponVal}% OFF on orders above ৳${newCouponMin.toLocaleString()}`,
      discountType: 'percentage',
      discountValue: Number(newCouponVal),
      minOrderAmount: Number(newCouponMin),
      isActive: true,
    };

    await dbService.saveCoupon(newCoupon);
    setCoupons((prev) => [...prev, newCoupon]);
    setNewCouponCode('');
    onShowToast(`Coupon ${newCoupon.code} created!`, 'success');
  };

  // Save Settings
  const handleSaveSettings = async () => {
    const updated = {
      ...storeSettings,
      shippingDhaka: Number(shippingDhaka),
      shippingOutsideDhaka: Number(shippingOutside),
    };
    await dbService.updateStoreSettings(updated);
    onShowToast('Delivery rates updated successfully!', 'success');
  };

  return (
    <div className="pb-24 bg-[#F8F5F0] min-h-screen">
      {/* Admin Top Bar */}
      <div className="bg-[#53121C] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="p-1 rounded text-stone-300 hover:text-white"
            title="Return to customer store"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-editorial text-lg font-bold">Nakshi Boutique Admin</h1>
            <p className="text-[10px] text-[#E2CFAB] tracking-widest uppercase">PostgreSQL Control Suite</p>
          </div>
        </div>

        <button
          onClick={() => {
            onRefreshProducts();
            onRefreshOrders();
            onShowToast('Refreshed data from database');
          }}
          className="p-2 rounded-full hover:bg-white/10 text-stone-200 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="bg-white border-b border-stone-200 px-4 py-2 flex gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'products', label: `Products (${products.length})` },
          { id: 'orders', label: `Orders (${orders.length})` },
          { id: 'coupons', label: 'Coupons' },
          { id: 'settings', label: 'Shipping & Rates' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#53121C] text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 uppercase font-semibold block">Total Revenue</span>
                <span className="text-xl font-bold text-stone-900 mt-1 block font-mono">
                  ৳{totalSales.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                  From {orders.filter((o) => o.status !== 'cancelled').length} valid orders
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 uppercase font-semibold block">Pending Dispatch</span>
                <span className="text-xl font-bold text-amber-800 mt-1 block font-mono">
                  {pendingOrdersCount}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                  Awaiting review
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 uppercase font-semibold block">Active Catalog</span>
                <span className="text-xl font-bold text-stone-900 mt-1 block font-mono">
                  {products.length}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                  Garment designs
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[11px] text-stone-500 uppercase font-semibold block">Low Inventory Alert</span>
                <span className="text-xl font-bold text-rose-700 mt-1 block font-mono">
                  {lowStockProducts.length}
                </span>
                <span className="text-[10px] text-rose-600 font-medium mt-1 block">
                  Pieces &lt; 5 stock
                </span>
              </div>
            </div>

            {/* Low stock alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Restock Attention Needed</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-stone-700">
                      <span className="truncate max-w-[200px]">{p.name}</span>
                      <span className="font-mono font-bold text-rose-700">{p.totalStock} left</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-stone-700">Catalog Registry</span>
              <button
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'sarees',
                    price: 12000,
                    fabric: 'Pure Silk',
                    craftType: 'Handloom Embroidery',
                    totalStock: 8,
                    images: ['/src/assets/images/hero_jamdani_saree_1792493300704.jpg'],
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#53121C] hover:bg-[#681825] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Garment</span>
              </button>
            </div>

            <div className="space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-14 object-cover rounded bg-stone-100"
                    />
                    <div>
                      <h4 className="font-semibold text-stone-900 line-clamp-1">{p.name}</h4>
                      <p className="text-[11px] text-stone-500">{p.categoryName} · Stock: {p.totalStock}</p>
                      <p className="font-mono font-bold text-stone-900 mt-0.5">৳{p.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsProductModalOpen(true);
                      }}
                      className="p-1.5 text-stone-600 hover:text-[#53121C] border border-stone-200 rounded-lg hover:bg-stone-50"
                      title="Edit product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1.5 text-stone-400 hover:text-rose-700 border border-stone-200 rounded-lg hover:bg-rose-50"
                      title="Delete product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-stone-700">Orders Dispatched & Pending</span>

            {orders.map((o) => (
              <div key={o.id} className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-stone-900">{o.orderNumber}</span>
                    <p className="text-[11px] text-stone-500">{new Date(o.createdAt).toLocaleString()}</p>
                    <p className="font-semibold text-stone-900 mt-1">{o.customerName} ({o.customerPhone})</p>
                    <p className="text-stone-600 mt-0.5 text-[11px]">{o.deliveryAddress}, {o.district}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#53121C]">
                      ৳{o.totalAmount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-stone-500 uppercase">{o.paymentMethod}</span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="bg-stone-50 p-2 rounded-lg text-[11px] text-stone-600 space-y-1">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{it.productName} ({it.size}) × {it.quantity}</span>
                      <span className="font-mono">৳{it.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Status Updater */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="font-medium text-stone-600">Update Status:</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                    className="px-2.5 py-1 text-xs bg-stone-50 border border-stone-300 rounded-md font-semibold text-stone-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200">
              <h3 className="font-semibold text-xs text-stone-900 mb-2">Create New Voucher</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-2 text-xs">
                <div>
                  <label className="text-stone-600 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BOISHAKHI20"
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg uppercase font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-600 block mb-1">Discount %</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="50"
                      value={newCouponVal}
                      onChange={(e) => setNewCouponVal(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-stone-600 block mb-1">Min Order ৳</label>
                    <input
                      type="number"
                      required
                      min="500"
                      step="500"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#53121C] text-white rounded-lg font-semibold"
                >
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-stone-700">Active Boutique Coupons</h4>
              {coupons.map((c) => (
                <div key={c.id} className="bg-white p-3 rounded-xl border border-stone-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-mono font-bold text-[#53121C]">{c.code}</span>
                    <p className="text-[11px] text-stone-500">{c.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
            <h3 className="font-semibold text-stone-900">Delivery Rates Configuration</h3>
            <div>
              <label className="text-stone-600 block mb-1">Inside Dhaka Shipping (BDT ৳)</label>
              <input
                type="number"
                value={shippingDhaka}
                onChange={(e) => setShippingDhaka(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="text-stone-600 block mb-1">Outside Dhaka Shipping (BDT ৳)</label>
              <input
                type="number"
                value={shippingOutside}
                onChange={(e) => setShippingOutside(Number(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-[#53121C] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Rates</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit / Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200 mb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                {editingProduct?.id ? 'Edit Garment Piece' : 'Add New Garment'}
              </h3>
              <button
                onClick={() => {
                  setIsProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-stone-700 font-semibold block mb-1">Garment Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct?.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Dhakai Jamdani Muslin Saree"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Category *</label>
                  <select
                    value={editingProduct?.category || 'sarees'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  >
                    <option value="sarees">Sarees</option>
                    <option value="salwar-kameez">Salwar Kameez</option>
                    <option value="kurtis">Kurtis</option>
                    <option value="three-piece">Three-Piece Sets</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={editingProduct?.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Total Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct?.totalStock ?? 5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, totalStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-700 font-semibold block mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={editingProduct?.fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                    placeholder="e.g. Pure Cotton Muslin"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-700 font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct?.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Artisanal craft notes..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#53121C] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
