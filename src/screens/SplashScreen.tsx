import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashProps {
  onFinishSplash: () => void;
}

export const SplashScreen: React.FC<SplashProps> = ({ onFinishSplash }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishSplash();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinishSplash]);

  return (
    <div className="relative min-h-screen bg-[#53121C] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Subtle luxury geometric motifs */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-20 h-20 rounded-2xl border border-[#C5A059]/40 bg-gradient-to-b from-[#681825] to-[#3E0A13] flex items-center justify-center shadow-2xl mb-6">
          <div className="text-[#C5A059] font-editorial text-4xl font-bold tracking-widest">
            NK
          </div>
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[#FDFBF7]">
          Nakshi Closet
        </h1>
        <p className="text-[#E2CFAB] text-xs uppercase tracking-[0.25em] font-medium mt-2">
          Bengal Heritage & Boutique Fashion
        </p>

        {/* Elegant pulsing gold line indicator */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent animate-pulse" />
          <span className="text-[11px] text-[#E2CFAB]/80 tracking-widest uppercase font-light">
            Dhaka · Chittagong · Sylhet
          </span>
        </div>
      </div>
    </div>
  );
};

interface OnboardingProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: 'Heritage Weaves & Royal Jamdani',
      description: 'Discover authentic Dhakai Jamdani, Mirpur Katan silk, and handcrafted heirloom textiles directly from artisanal master weavers.',
      image: '/src/assets/images/hero_jamdani_saree_1792493300704.jpg',
      badge: 'Artisanal Elegance',
    },
    {
      title: 'Festive Salwar & Designer Kurtis',
      description: 'Hand-embroidered zardozi, tilla work, and pure organza ensembles tailored for weddings, Eid celebrations, and memorable occasions.',
      image: '/src/assets/images/product_salwar_kameez_1792493303553.jpg',
      badge: 'Festive Season',
    },
    {
      title: 'Express Delivery Across Bangladesh',
      description: 'Safe Cash on Delivery, prompt 48-hour delivery inside Dhaka, and doorstep dispatch to all 64 districts nationwide.',
      image: '/src/assets/images/product_kurti_designer_1792493305411.jpg',
      badge: 'Nationwide Trust',
    },
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem('nakshi_onboarding_completed', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('nakshi_onboarding_completed', 'true');
    onComplete();
  };

  const current = slides[slide];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between">
      {/* Top Bar with Skip */}
      <div className="flex items-center justify-between p-4">
        <span className="font-editorial text-lg font-bold text-[#53121C]">Nakshi Closet</span>
        <button
          onClick={handleSkip}
          className="text-xs font-medium text-stone-500 hover:text-stone-900 px-3 py-1.5"
        >
          Skip
        </button>
      </div>

      {/* Slide Image with smooth transition */}
      <div className="px-4 flex-1 flex flex-col justify-center">
        <div className="relative aspect-3/4 max-h-[380px] w-full rounded-2xl overflow-hidden shadow-md mx-auto">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="bg-[#53121C] text-[#E2CFAB] text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm">
              {current.badge}
            </span>
          </div>
        </div>

        {/* Content text */}
        <div className="mt-6 text-center px-2">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            {current.title}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed max-w-sm mx-auto">
            {current.description}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-6">
        {/* Indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === slide ? 'w-6 bg-[#53121C]' : 'w-2 bg-stone-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#53121C] hover:bg-[#681825] text-white text-sm font-semibold tracking-wide transition-all shadow-md active:scale-[0.99]"
        >
          <span>{slide === slides.length - 1 ? 'Start Shopping' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
