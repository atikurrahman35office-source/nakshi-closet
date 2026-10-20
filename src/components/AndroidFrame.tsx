import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, ShieldCheck, Database, Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  deviceMode: 'mobile' | 'responsive';
  onToggleDeviceMode: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  onOpenDownloadModal?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  deviceMode,
  onToggleDeviceMode,
  isAdmin,
  onToggleAdmin,
  onOpenSupabaseModal,
  isSupabaseConnected,
  onOpenDownloadModal,
}) => {
  const [time, setTime] = useState('10:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#ECE7DE] flex flex-col items-center">
      {/* Top Universal Preview Control Bar */}
      <div className="w-full bg-[#1C1917] text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-stone-800 z-50">
        <div className="flex items-center gap-2">
          <span className="font-editorial text-base font-bold text-[#E2CFAB] tracking-wide">
            Nakshi Closet
          </span>
          <span className="text-stone-400 hidden sm:inline">|</span>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Android Shopping Suite
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Download App Guide Button */}
          {onOpenDownloadModal && (
            <button
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#53121C] hover:bg-[#681825] text-white transition-colors shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#E2CFAB]" />
              <span>অ্যাপ ডাউনলোড</span>
            </button>
          )}

          {/* Supabase Status Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              isSupabaseConnected
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-[#C5A059]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSupabaseConnected ? 'Supabase Connected' : 'Supabase (Local Mode)'}</span>
          </button>

          {/* Admin Switcher */}
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              isAdmin
                ? 'bg-[#C5A059] text-stone-900'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Admin Portal Active' : 'Admin Portal'}</span>
          </button>

          {/* Device Frame Switcher */}
          <button
            onClick={onToggleDeviceMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Switch between Android Frame and Full View"
          >
            {deviceMode === 'mobile' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Full Width View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Android Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Body: Phone Mockup or Responsive Canvas */}
      <div className="w-full flex-1 flex items-start justify-center p-2 sm:p-6 overflow-x-hidden">
        {deviceMode === 'mobile' ? (
          /* Android Smartphone Shell */
          <div className="relative w-full max-w-[412px] bg-[#1C1917] rounded-[48px] p-3 shadow-2xl border-[5px] border-[#2B2724] ring-1 ring-black/40 overflow-hidden my-auto">
            {/* Inner Screen */}
            <div className="relative w-full bg-[#FAF7F2] rounded-[38px] overflow-hidden flex flex-col min-h-[780px] max-h-[880px]">
              {/* Android Status Bar */}
              <div className="bg-[#FAF7F2] text-stone-800 px-6 pt-3 pb-1 flex items-center justify-between text-xs select-none shrink-0 z-30">
                <span className="font-semibold tracking-tight text-[11px]">{time}</span>

                {/* Android Punch Hole Camera */}
                <div className="w-3.5 h-3.5 rounded-full bg-black shadow-inner -mt-1" />

                <div className="flex items-center gap-1.5 text-stone-700">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <BatteryMedium className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Scrollable App Viewport */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative">
                {children}
              </div>

              {/* Android Bottom Gesture Bar */}
              <div className="bg-[#FAF7F2] py-2 flex justify-center shrink-0 z-30">
                <div className="w-32 h-1 bg-stone-400 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* Responsive View */
          <div className="w-full max-w-4xl bg-[#FAF7F2] rounded-2xl border border-stone-300 shadow-xl overflow-hidden min-h-[800px]">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
