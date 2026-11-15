import React from 'react';
import { Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0f172a] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-400/40 bg-white p-0.5 flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/WhatsApp_Image_2026-11-15_at_11.36.34_PM_c5c7ed27.jpeg"
                  alt="OM RAJPUT TRADING COMPANY Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                OM RAJPUT TRADING COMPANY
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Your Trusted Partner in Industrial Material Supply. Supplying high-performance moisture control desiccant powders, calcined lime powders, and masterbatches for plastic compounding and recycling.
            </p>
          </div>

          {/* Column 1: COMPANY */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              COMPANY
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-pink-400 transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('applications')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Applications
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quality')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Quality
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-pink-400 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: VISIT */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              VISIT
            </h4>
            <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-slate-200">
                OM RAJPUT TRADING COMPANY
              </p>
              <p>
                Shop No. 2, Survey No. 269, Mahyavanshi Falia, Dadra, Village Dadra (D. & N.H.) 396193
              </p>
            </div>
          </div>

          {/* Column 3: CALL */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              CALL
            </h4>
            <div className="text-xs text-slate-300">
              <a
                href="tel:+917202007309"
                className="inline-flex items-center space-x-1.5 font-bold text-pink-400 hover:text-pink-300 transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-pink-400" />
                <span>+91 7202007309</span>
              </a>
              <p className="text-[11px] text-slate-500 mt-1">
                Mon - Sat: 9:00 AM - 7:00 PM IST
              </p>
            </div>
          </div>

        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 OM RAJPUT TRADING COMPANY. All rights reserved.
          </div>
          <div className="font-semibold text-slate-400 tracking-wider">
            DADRA · DADRA & NAGAR HAVELI · INDIA
          </div>
        </div>

      </div>
    </footer>
  );
};
