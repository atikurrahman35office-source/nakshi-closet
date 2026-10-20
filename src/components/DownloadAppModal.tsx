import React, { useState } from 'react';
import { X, Smartphone, Download, QrCode, Globe, Check, Copy } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'expogo'>('instant');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const apkCommand = 'cd expo-app\nnpm install\nnpm install -g eas-cli\neas login\neas build -p android --profile preview';

  const handleCopyCommand = () => {
    navigator.clipboard?.writeText(apkCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto text-xs shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="bg-[#53121C] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#C5A059]" />
            <div>
              <h2 className="font-editorial text-base font-bold">
                অ্যাপ ডাউনলোড ও ইনস্টল পদ্ধতি
              </h2>
              <p className="text-[10px] text-[#E2CFAB]">How to download Nakshi Closet App</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-3 pt-2 gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('instant')}
            className={`pb-2 px-2.5 transition-colors border-b-2 ${
              activeTab === 'instant'
                ? 'border-[#53121C] text-[#53121C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ১. মোবাইলে সরাসরি (১ মিনিটে)
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2 px-2.5 transition-colors border-b-2 ${
              activeTab === 'apk'
                ? 'border-[#53121C] text-[#53121C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ২. Android APK তৈরি
          </button>
          <button
            onClick={() => setActiveTab('expogo')}
            className={`pb-2 px-2.5 transition-colors border-b-2 ${
              activeTab === 'expogo'
                ? 'border-[#53121C] text-[#53121C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            ৩. Expo Go দিয়ে টেস্ট
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 space-y-3.5 text-stone-700">
          {activeTab === 'instant' && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50/60 border border-[#53121C]/20 rounded-xl">
                <span className="font-bold text-[#53121C] text-xs block mb-1">
                  সবচেয়ে সহজ উপায় (কোন কোডিং লাগবে না):
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  আপনার মোবাইল ফোনের <strong>Google Chrome</strong> ব্রাউজারে এই লিঙ্কটি ওপেন করে এক ক্লিকেই ফোনের হোমস্ক্রিনে অ্যাপটি ইনস্টল করে নিতে পারবেন।
                </p>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-stone-900 block text-xs">ইনস্টল করার নিয়ম:</span>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                  <li>নিচের লিঙ্কটি কপি করে আপনার মোবাইলের Chrome ব্রাউজারে পেস্ট করুন।</li>
                  <li>ব্রাউজারের উপরের ডান কোনায় <strong>৩টি ডট (Menu ⋮)</strong> আইকনে চাপ দিন।</li>
                  <li>মেনু থেকে <strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> চাপুন।</li>
                  <li>সাথে সাথে আপনার ফোনে <strong>Nakshi Closet</strong> অ্যাপের আইকন যুক্ত হয়ে যাবে!</li>
                </ol>
              </div>

              {/* Shareable Link Box */}
              <div className="pt-2">
                <label className="text-[10px] text-stone-500 uppercase font-semibold block mb-1">
                  অ্যাপের লিঙ্ক (ফোনে ওপেন করার জন্য):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-2.5 py-1.5 bg-stone-100 border border-stone-300 rounded-lg text-[11px] font-mono text-stone-700 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-[#53121C] hover:bg-[#681825] text-white rounded-lg font-semibold flex items-center gap-1 shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="font-bold text-stone-900 text-xs block mb-1">
                  অরিজিনাল Android (.apk) ফাইল তৈরি:
                </span>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  আমরা প্রোজেক্টের ভেতর <code>expo-app/app.json</code> এবং <code>expo-app/eas.json</code> পুরোপুরি প্রস্তুত করে রেখেছি। নিচের কমান্ডটি আপনার কম্পিউটারের টার্মিনালে চালালেই Expo ক্লাউড সরাসরি APK বিল্ড করে ডাউনলোড লিঙ্ক দিয়ে দিবে।
                </p>
              </div>

              <div className="relative bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-[10px] space-y-1 leading-relaxed overflow-x-auto">
                <button
                  onClick={handleCopyCommand}
                  className="absolute top-2 right-2 px-2 py-1 bg-stone-800 hover:bg-stone-700 text-[#E2CFAB] rounded text-[10px] flex items-center gap-1"
                >
                  {copiedCommand ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCommand ? 'Copied' : 'Copy'}</span>
                </button>
                <div className="text-stone-400"># Windows Terminal / PowerShell এ চালান:</div>
                <div className="text-emerald-400">cd expo-app</div>
                <div className="text-emerald-400">npm install</div>
                <div className="text-emerald-400">npm install -g eas-cli</div>
                <div className="text-emerald-400">eas login</div>
                <div className="text-emerald-400">eas build -p android --profile preview</div>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                বিল্ড সম্পন্ন হলে একটি সরাসরি <strong>Download URL</strong> এবং <strong>QR Code</strong> পাওয়া যাবে। সেটি থেকে সরাসরি <code>NakshiCloset.apk</code> ফোনে ডাউনলোড করে ইন্সটল করা যাবে।
              </div>
            </div>
          )}

          {activeTab === 'expogo' && (
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="font-bold text-stone-900 text-xs block mb-1">
                  Expo Go দিয়ে ফোনে সরাসরি চালানো:
                </span>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] leading-relaxed">
                  <li>আপনার Android ফোনে Google Play Store থেকে <strong>Expo Go</strong> অ্যাপ ইন্সটল করুন।</li>
                  <li>কম্পিউটারে <code>cd expo-app && npx expo start</code> চালান।</li>
                  <li>টার্মিনালে আসা QR Code টি মোবাইলের Expo Go দিয়ে স্ক্যান করলেই আপনার ফোনে সাথে সাথে Nakshi Closet অ্যাপটি ওপেন হয়ে যাবে!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#53121C] text-white text-xs font-semibold rounded-lg hover:bg-[#681825]"
          >
            বুঝেছি / Close
          </button>
        </div>
      </div>
    </div>
  );
};
