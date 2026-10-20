import React, { useState } from 'react';
import { X, Database, Shield, Key, ExternalLink, CheckCircle2, Copy, Check } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: { url: string; key: string; isConnected: boolean };
  onSave: (url: string, key: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [key, setKey] = useState(config.key || '');
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'instructions'>('config');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(url, key);
  };

  const handleCopySqlGuide = () => {
    navigator.clipboard?.writeText(
      `-- Nakshi Closet Schema Migration is stored at supabase/migrations/20261020000000_nakshi_closet_schema.sql`
    );
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-xs shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="bg-[#53121C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C5A059]" />
            <div>
              <h2 className="font-editorial text-base font-bold">Supabase Backend Configuration</h2>
              <p className="text-[10px] text-stone-300">PostgreSQL with Row Level Security (RLS)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2 px-2 transition-colors border-b-2 ${
              activeTab === 'config'
                ? 'border-[#53121C] text-[#53121C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Connection Keys
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2 px-2 transition-colors border-b-2 ${
              activeTab === 'schema'
                ? 'border-[#53121C] text-[#53121C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Database Schema & RLS
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2 px-2 transition-colors border-b-2 ${
              activeTab === 'instructions'
                ? 'border-[#53121C] text-[#53121C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            EAS Android Build Guide
          </button>
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'config' && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-center gap-2 text-stone-800 font-semibold mb-1">
                  <Shield className="w-4 h-4 text-[#53121C]" />
                  <span>Current Status: {config.isConnected ? 'Cloud Connected' : 'Local Storage Fallback'}</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  The application is fully operational right now with client-side PostgreSQL simulation and authoritative price/stock validation. You can connect your live Supabase project anytime by pasting your credentials below.
                </p>
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-800 block mb-1">
                  Supabase Anon / Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono text-xs text-stone-900 focus:outline-none focus:border-[#53121C]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setKey('');
                    onSave('', '');
                  }}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-stone-700 font-semibold"
                >
                  Reset to Local
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#53121C] text-white font-semibold rounded-lg shadow-xs"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <p className="text-stone-600 leading-relaxed">
                The database schema is fully defined in <code>supabase/migrations/20261020000000_nakshi_closet_schema.sql</code>. It includes 16 tables, PostgreSQL Row Level Security (RLS) policies, and atomic checkout function.
              </p>

              <div className="bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                <div>1. profiles (id UUID, role TEXT, phone, address)</div>
                <div>2. categories (id, name, slug)</div>
                <div>3. products (id, name, price, stock, fabric)</div>
                <div>4. product_variants (id, size, color, stock, sku)</div>
                <div>5. orders (id, order_number, total_amount, status)</div>
                <div>6. order_items (order_id, product_id, quantity, unit_price)</div>
                <div>7. coupons (code, discount_type, discount_value)</div>
                <div>8. store_settings (shipping_dhaka, shipping_outside)</div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <strong>RLS Enforcement:</strong> Customers can only read and insert their own orders and profile records. Normal users cannot alter product prices or grant themselves admin privileges.
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-2 text-stone-700">
              <h3 className="font-bold text-stone-900">Android APK Build Steps (EAS CLI):</h3>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Install EAS CLI: <code>npm install -g eas-cli</code></li>
                <li>Log in to Expo: <code>eas login</code></li>
                <li>Configure build: <code>eas build:configure</code></li>
                <li>Run Android APK build: <code>eas build -p android --profile preview</code></li>
                <li>Download generated .apk directly to your Android phone and install!</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
