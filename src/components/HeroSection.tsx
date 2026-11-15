import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Layers
} from 'lucide-react';

interface HeroSectionProps {
  onExploreProducts: () => void;
  onOpenGSTRegister: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreProducts,
  onOpenGSTRegister,
}) => {
  // Loop strictly between the two owner-supplied live depot showcase images
  const heroVisuals = [
    {
      url: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_10.26.06_PM_cad4ee11.jpeg',
      title: 'Dadra Warehouse Ready Stock (25 KG)',
      subtitle: 'Hermetic 25.00 KG sealed sacks stacked dry with zero-hooks handling policy',
      tag: 'Live Depot Inventory',
    },
    {
      url: '/assets/aistudio/WhatsApp_Image_2026-11-15_at_10.26.06_PM__1__c8c2e603.jpeg',
      title: 'Bulk Industrial Material Supply',
      subtitle: 'High-volume desiccant powders, calcined lime grades, and polymer additives ready for dispatch',
      tag: 'Direct Warehouse Stock',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroVisuals.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroVisuals.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#faf8fc] via-[#f5f3ff]/60 to-white pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-purple-100/70">
      {/* Subtle lavender and pink atmospheric glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trust badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-100/90 to-pink-100/90 border border-purple-200/70 text-[#1e1b4b] text-xs font-bold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              <span>OM RAJPUT TRADING COMPANY · DADRA, INDIA</span>
            </div>

            {/* Main Required Hero Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f172a] tracking-tight leading-[1.12]">
              Industrial{' '}
              <span className="bg-gradient-to-r from-[#1e1b4b] via-[#4338ca] to-[#db2777] bg-clip-text text-transparent">
                Moisture Control
              </span>{' '}
              Solutions
            </h1>

            {/* Tagline & Subtext */}
            <p className="text-lg sm:text-xl text-[#334155] font-medium leading-relaxed max-w-2xl">
              Your Trusted Partner in Industrial Material Supply.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Specialized active desiccant powders, calcined lime powders, and masterbatches engineered to permanently absorb volatile moisture during plastic extrusion, blown film, and injection molding. Eliminate bubbles, voids, and downtime with direct Dadra warehouse supply.
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-2 gap-3 pt-2 max-w-xl text-xs sm:text-sm text-slate-700 font-semibold">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prevents pinholes & fish-eyes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard 25.00 KG dry packaging</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Optimized for recycled polymers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GST-verified business orders</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={onExploreProducts}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-[#2e1065] hover:to-[#db2777] transition-all transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenGSTRegister}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-purple-50 text-[#1e1b4b] font-bold text-sm border-2 border-purple-200 hover:border-purple-300 shadow-2xs transition-all flex items-center space-x-2"
              >
                <span>Register with GSTIN</span>
              </button>
            </div>

            {/* Operational Stats */}
            <div className="pt-6 border-t border-purple-100 flex items-center space-x-8 text-xs text-slate-500">
              <div>
                <span className="block text-xl font-extrabold text-[#0f172a]">25 KG</span>
                <span>Hermetic Bag Size</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="block text-xl font-extrabold text-[#0f172a]">1% – 3%</span>
                <span>Active Dosing Range</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="block text-xl font-extrabold text-[#0f172a]">Dadra</span>
                <span>Industrial Depot Hub</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Showcase (Looping visual combining product images per Section 3) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative card */}
              <div className="relative rounded-3xl bg-white p-3 shadow-xl border border-purple-100/90 overflow-hidden">
                
                {/* Visual container with muted auto-loop animation */}
                <div className="relative aspect-4/3 sm:aspect-16/11 rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
                  
                  {/* Dynamic background images cross-fading */}
                  {heroVisuals.map((visual, idx) => (
                    <div
                      key={visual.url}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                      style={{ transitionProperty: 'opacity, transform' }}
                    >
                      <img
                        src={visual.url}
                        alt={visual.title}
                        className="w-full h-full object-cover object-center filter brightness-95"
                      />
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
                    </div>
                  ))}

                  {/* Header Badge in video display */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-pink-400 mr-1.5 animate-ping"></span>
                      Verified Product Visuals
                    </span>
                  </div>

                  {/* Active Slide Information Banner */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 p-3.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-pink-300">
                      {heroVisuals[activeIndex].tag}
                    </div>
                    <div className="font-bold text-sm text-white mt-0.5">
                      {heroVisuals[activeIndex].title}
                    </div>
                    <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      {heroVisuals[activeIndex].subtitle}
                    </div>
                  </div>

                  {/* Playhead dots indicator */}
                  <div className="absolute bottom-16 right-3 flex space-x-1.5 z-10">
                    {heroVisuals.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveIndex(dotIdx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          dotIdx === activeIndex ? 'bg-pink-400 w-5' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>

                </div>

                {/* Technical highlight beneath hero container */}
                <div className="p-3 bg-purple-50/50 rounded-xl mt-2 border border-purple-100 flex items-center justify-between text-xs text-slate-700">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#4338ca]" />
                    <span className="font-semibold text-slate-800">
                      Direct Manufacturer Sourced Additives
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-md">
                    ISO Standard Tested
                  </span>
                </div>

              </div>

              {/* Floating feature pills */}
              <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white py-2.5 px-4 rounded-2xl shadow-lg border border-purple-100 items-center space-x-3 z-20">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-[#db2777]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Zero Hooks Policy</div>
                  <div className="text-[10px] text-slate-500">100% Hermetic Seal Retained</div>
                </div>
              </div>

              <div className="hidden sm:flex absolute -top-5 -right-6 bg-white py-2.5 px-4 rounded-2xl shadow-lg border border-purple-100 items-center space-x-3 z-20">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-[#4338ca]">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Dadra Warehouse</div>
                  <div className="text-[10px] text-slate-500">Ready Palletized Dispatch</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
