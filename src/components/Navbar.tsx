import React, { useState } from 'react';
import {
  Building2,
  FileText,
  ShieldCheck,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  PhoneCall,
  PackageCheck
} from 'lucide-react';
import { UserProfile, CompanyProfile } from '../types/index.ts';

interface NavbarProps {
  user: UserProfile | null;
  company: CompanyProfile | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenGSTRegister: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  company,
  activeView,
  setActiveView,
  onOpenGSTRegister,
  onOpenAuth,
  onLogout,
  unreadCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
      {/* Top emergency dispatch / contact bar */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#1e1b4b] text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between font-medium">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-purple-200">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            Dadra Warehouse Dispatch Active: 25 KG Bags Ready
          </span>
          <span className="hidden md:inline text-purple-300/60">|</span>
          <span className="hidden md:inline text-purple-200">
            GST Verified B2B Plastic Additive Supplier
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <a
            href="tel:+917202007309"
            className="flex items-center text-pink-300 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3 h-3 mr-1" />
            +91 7202007309
          </a>
          <span className="text-purple-400/40">•</span>
          <span className="text-slate-300">Dadra (D.&N.H.) 396193</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveView('home')}
          >
            <div className="w-13 h-13 rounded-xl overflow-hidden shadow-xs border border-amber-200/70 bg-white p-0.5 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shrink-0">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-15_at_11.36.34_PM_c5c7ed27.jpeg"
                alt="OM RAJPUT TRADING COMPANY Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight text-[#0f172a] leading-none group-hover:text-[#4338ca] transition-colors">
                OM RAJPUT TRADING COMPANY
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-1">
                Industrial Material Supply · Dadra
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeView === 'home'
                  ? 'text-[#4338ca] bg-purple-50'
                  : 'text-slate-700 hover:text-[#4338ca] hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('products')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeView === 'products'
                  ? 'text-[#4338ca] bg-purple-50'
                  : 'text-slate-700 hover:text-[#4338ca] hover:bg-slate-50'
              }`}
            >
              Product Catalogue
            </button>
            <button
              onClick={() => setActiveView('applications')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeView === 'applications'
                  ? 'text-[#4338ca] bg-purple-50'
                  : 'text-slate-700 hover:text-[#4338ca] hover:bg-slate-50'
              }`}
            >
              Applications
            </button>
            <button
              onClick={() => setActiveView('quality')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeView === 'quality'
                  ? 'text-[#4338ca] bg-purple-50'
                  : 'text-slate-700 hover:text-[#4338ca] hover:bg-slate-50'
              }`}
            >
              Quality Standards
            </button>
            <button
              onClick={() => setActiveView('about')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeView === 'about'
                  ? 'text-[#4338ca] bg-purple-50'
                  : 'text-slate-700 hover:text-[#4338ca] hover:bg-slate-50'
              }`}
            >
              About
            </button>
          </nav>

          {/* Action & Portal Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'admin' ? (
                  <button
                    onClick={() => setActiveView('admin')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1e1b4b] to-[#312e81] text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow-md transition-all border border-indigo-900/20"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Admin Portal</span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      Owner
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveView('buyer')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-[#1e1b4b] font-semibold text-xs tracking-wide shadow-2xs hover:border-purple-300 transition-all"
                  >
                    <PackageCheck className="w-4 h-4 text-[#db2777]" />
                    <span>Buyer Dashboard</span>
                    {user.status === 'approved' ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        Pending
                      </span>
                    )}
                  </button>
                )}

                {/* Notifications indicator */}
                <div className="relative">
                  <button
                    onClick={() => setActiveView(user.role === 'admin' ? 'admin' : 'buyer')}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#4338ca] bg-slate-50 hover:bg-purple-50/60 rounded-xl transition-all border border-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenGSTRegister}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#4338ca] via-[#6366f1] to-[#db2777] hover:opacity-95 rounded-xl shadow-xs transition-all"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Register with GSTIN</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-purple-50 text-slate-700"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveView('products');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-purple-50 text-slate-700"
            >
              Products Catalogue
            </button>
            <button
              onClick={() => {
                setActiveView('applications');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-purple-50 text-slate-700"
            >
              Applications
            </button>
            <button
              onClick={() => {
                setActiveView('quality');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-medium rounded-lg hover:bg-purple-50 text-slate-700"
            >
              Quality
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setActiveView(user.role === 'admin' ? 'admin' : 'buyer');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-xl bg-[#1e1b4b] text-white font-semibold text-xs"
                >
                  {user.role === 'admin' ? 'Open Admin Portal' : 'Open Buyer Dashboard'}
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs text-red-600 font-medium"
                >
                  Sign Out ({user.email})
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onOpenGSTRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4338ca] to-[#db2777] text-white font-bold text-xs"
                >
                  Register with 15-Digit GSTIN
                </button>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
