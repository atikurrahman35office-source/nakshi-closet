import React, { useState } from 'react';
import { UserProfile } from '../types';
import { BANGLADESH_DISTRICTS } from '../lib/seedData';
import { User, ShieldCheck, MapPin, Package, Heart, Phone, Database, ExternalLink, LogOut, Check, Smartphone } from 'lucide-react';
import { ScreenName } from '../store/useStore';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onToggleRole: () => void;
  onNavigate: (screen: ScreenName) => void;
  onOpenSupabaseModal: () => void;
  onOpenDownloadModal?: () => void;
  isSupabaseConnected: boolean;
  onShowToast: (msg: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onUpdateUser,
  onToggleRole,
  onNavigate,
  onOpenSupabaseModal,
  onOpenDownloadModal,
  isSupabaseConnected,
  onShowToast,
}) => {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(user.defaultAddress || '');
  const [district, setDistrict] = useState(user.defaultDistrict || 'Dhaka');

  const handleSaveAddress = () => {
    onUpdateUser({
      defaultAddress: address,
      defaultDistrict: district,
    });
    setIsEditingAddress(false);
    onShowToast('Delivery address updated!');
  };

  return (
    <div className="pb-28 bg-[#FDFBF7] min-h-screen">
      {/* Top Header Card */}
      <div className="bg-[#53121C] text-white p-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 border-2 border-[#C5A059] flex items-center justify-center text-white font-editorial text-2xl font-bold shadow-md">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl font-bold">{user.name}</h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                user.role === 'admin' ? 'bg-[#C5A059] text-stone-900' : 'bg-white/20 text-white'
              }`}>
                {user.role === 'admin' ? 'Boutique Admin' : 'Shopper'}
              </span>
            </div>
            <p className="text-stone-300 text-xs mt-0.5">{user.email}</p>
            <p className="text-stone-300 text-xs">{user.phone}</p>
          </div>
        </div>

        {/* Role Switcher Action */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-stone-300">
            <span>Current view: </span>
            <strong className="text-white capitalize">{user.role} mode</strong>
          </div>
          <button
            onClick={onToggleRole}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059] hover:bg-[#d8b56d] text-stone-900 text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Switch to {user.role === 'admin' ? 'Customer' : 'Admin'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 -mt-4 space-y-3">
        {/* Supabase Integration Status Card */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#53121C]" />
              <span className="font-semibold text-xs text-stone-900">Backend & PostgreSQL</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isSupabaseConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {isSupabaseConnected ? 'Connected to Cloud' : 'Persistent Local Mode'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1.5">
            {isSupabaseConnected
              ? 'Synchronized with your Supabase cloud project with Row Level Security.'
              : 'Running in high-fidelity offline mode with full checkout and schema validation.'}
          </p>
          <button
            onClick={onOpenSupabaseModal}
            className="mt-2.5 text-xs font-semibold text-[#53121C] hover:underline flex items-center gap-1"
          >
            <span>Configure Supabase Credentials & View Schema</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Saved Delivery Address */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#53121C]" />
              <span>Default Delivery Address</span>
            </span>
            <button
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs text-[#53121C] hover:underline font-semibold"
            >
              {isEditingAddress ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingAddress ? (
            <div className="space-y-2 mt-2 pt-2 border-t border-stone-100">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                placeholder="Street address..."
              />
              <button
                onClick={handleSaveAddress}
                className="px-3 py-1.5 bg-[#53121C] text-white text-xs font-semibold rounded-lg"
              >
                Save Address
              </button>
            </div>
          ) : (
            <div className="text-xs text-stone-600">
              <p className="font-medium text-stone-900">{user.defaultAddress || 'No address saved.'}</p>
              <p className="text-stone-500 mt-0.5">District: {user.defaultDistrict || 'Dhaka'}</p>
            </div>
          )}
        </div>

        {/* App Download Option */}
        {onOpenDownloadModal && (
          <div className="bg-white p-4 rounded-xl border border-[#53121C]/30 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#53121C]" />
                <span className="font-semibold text-xs text-stone-900">মোবাইলে অ্যাপ ইনস্টল করুন</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-[#53121C] border border-[#53121C]/20">
                Android
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 leading-relaxed">
              আপনার ফোনে সরাসরি অ্যাপটি ডাউনলোড করতে অথবা ১ ক্লিকে Chrome ব্রাউজার থেকে ইনস্টল করার সম্পূর্ণ নির্দেশিকা দেখুন।
            </p>
            <button
              onClick={onOpenDownloadModal}
              className="mt-2.5 px-3 py-1.5 bg-[#53121C] hover:bg-[#681825] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ডাউনলোড ও ইনস্টল নির্দেশিকা খুলুন</span>
            </button>
          </div>
        )}

        {/* Quick Shortcuts */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs divide-y divide-stone-100 text-xs">
          <button
            onClick={() => onNavigate('orders')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-stone-800 font-medium">
              <Package className="w-4 h-4 text-stone-500" />
              <span>Track Orders</span>
            </span>
            <span className="text-stone-400">→</span>
          </button>
          <button
            onClick={() => onNavigate('wishlist')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors"
          >
            <span className="flex items-center gap-2.5 text-stone-800 font-medium">
              <Heart className="w-4 h-4 text-stone-500" />
              <span>Saved Wishlist</span>
            </span>
            <span className="text-stone-400">→</span>
          </button>
          {user.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className="w-full p-3.5 flex items-center justify-between bg-rose-50/50 hover:bg-rose-50 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-[#53121C] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Open Admin Portal</span>
              </span>
              <span className="text-[#53121C]">→</span>
            </button>
          )}
        </div>

        {/* Concierge & Support */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs text-xs space-y-2">
          <h3 className="font-semibold text-stone-900 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-[#53121C]" />
            <span>Nakshi Boutique Concierge</span>
          </h3>
          <p className="text-stone-600 leading-relaxed">
            For bespoke saree sizing, bridal appointments, or order assistance:
          </p>
          <div className="pt-1 font-mono text-stone-900 font-bold">
            Hotline: +880 1711-098765
          </div>
          <div className="text-[11px] text-stone-500">
            Available Saturday - Thursday (10:00 AM - 8:00 PM BST)
          </div>
        </div>

        {/* Reset / Logout */}
        <div className="pt-2">
          <button
            onClick={() => {
              localStorage.removeItem('nakshi_onboarding_completed');
              onShowToast('Reset onboarding walkthrough. Launching splash...');
              onNavigate('splash');
            }}
            className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-xs font-medium border border-stone-200 rounded-xl bg-white"
          >
            Replay Splash & Onboarding
          </button>
        </div>
      </div>
    </div>
  );
};
