import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ApplicationsSection, QualitySection } from './components/ApplicationsSection.tsx';
import { Footer } from './components/Footer.tsx';
import { GSTRegisterModal } from './components/GSTRegisterModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BuyerDashboard } from './components/BuyerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Product, UserProfile, CompanyProfile } from './types/index.ts';
import { Search, Filter, ShieldCheck, ArrowRight } from 'lucide-react';

import { auth } from './lib/firebase.ts';
import { signOut } from 'firebase/auth';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'products' | 'about' | 'applications' | 'quality' | 'buyer' | 'admin'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // User & Auth State (never auto-login as admin)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentCompany, setCurrentCompany] = useState<CompanyProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('omr_token'));

  // Modals
  const [gstRegisterOpen, setGstRegisterOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Products filtering on catalogue view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load products
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Check current session
  const checkSession = async (token?: string) => {
    const tokenToUse = token ?? authToken;
    if (!tokenToUse) {
      setCurrentUser(null);
      setCurrentCompany(null);
      return null;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        setCurrentCompany(data.company);
        return data.user as UserProfile;
      } else {
        localStorage.removeItem('omr_token');
        setAuthToken(null);
        setCurrentUser(null);
        setCurrentCompany(null);
        setActiveView((prev) => (prev === 'admin' || prev === 'buyer' ? 'home' : prev));
        return null;
      }
    } catch (err) {
      console.error('Session check failed:', err);
      return null;
    }
  };

  useEffect(() => {
    loadProducts();
    checkSession();
  }, []);

  const handleAuthSuccess = async (token: string, _email: string) => {
    localStorage.setItem('omr_token', token);
    setAuthToken(token);
    const verifiedUser = await checkSession(token);
    if (verifiedUser?.role === 'admin') {
      setActiveView('admin');
    } else if (verifiedUser) {
      setActiveView('buyer');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('omr_token');
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentCompany(null);
    setActiveView('home');
    try {
      await signOut(auth);
    } catch {
      // ignore firebase signout error if signed in via email/password
    }
  };

  const handleQuickOrder = (prod: Product) => {
    if (!currentUser) {
      setSelectedProduct(prod);
      setAuthModalOpen(true);
    } else if (currentUser.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('buyer');
    }
  };

  // Filter products for catalogue
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', 'Desiccant Powder', 'Industrial Lime Powder', 'Desiccant Masterbatch', 'Filler Masterbatch', 'Specialty Mineral Powder'];

  return (
    <div className="min-h-screen bg-[#faf8fc] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      
      {/* Navigation */}
      <Navbar
        user={currentUser}
        company={currentCompany}
        activeView={activeView}
        setActiveView={(v) => setActiveView(v as any)}
        onOpenGSTRegister={() => setGstRegisterOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        unreadCount={currentUser?.unreadNotifications || 0}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME */}
        {activeView === 'home' && (
          <div>
            <HeroSection
              onExploreProducts={() => setActiveView('products')}
              onOpenGSTRegister={() => setGstRegisterOpen(true)}
            />

            {/* Featured Products Grid */}
            <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-3">
                    <span>COMPLETE PRODUCT PORTFOLIO</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
                    Industrial De-Moisturizers & Plastic Additives
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                    Eight verified industrial formulations supplied in standard 25.00 KG dry sacks. Direct factory depot loading in Dadra.
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('products')}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-[#4338ca] hover:text-[#312e81] shrink-0"
                >
                  <span>View All 8 Listings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={(p) => setSelectedProduct(p)}
                    onOrderProduct={handleQuickOrder}
                  />
                ))}
              </div>
            </section>

            <AboutSection />
            <ApplicationsSection />
            <QualitySection />
          </div>
        )}

        {/* VIEW 2: PRODUCT CATALOGUE */}
        {activeView === 'products' && (
          <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4338ca] bg-purple-100 px-3 py-1 rounded-full">
                Factory Sourced Catalogue
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mt-3 tracking-tight">
                Industrial Moisture Scavengers & Polymer Additives
              </h1>
              <p className="text-sm text-slate-600 mt-2">
                Discover technical specifications, active chemical properties, and order directly using your registered GSTIN.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, grade, or plastic application..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex overflow-x-auto space-x-1.5 w-full md:w-auto pb-1 md:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#1e1b4b] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(p) => setSelectedProduct(p)}
                  onOrderProduct={handleQuickOrder}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ABOUT */}
        {activeView === 'about' && (
          <div className="py-8">
            <AboutSection />
          </div>
        )}

        {/* VIEW 4: APPLICATIONS */}
        {activeView === 'applications' && (
          <div className="py-8">
            <ApplicationsSection />
          </div>
        )}

        {/* VIEW 5: QUALITY */}
        {activeView === 'quality' && (
          <div className="py-8">
            <QualitySection />
          </div>
        )}

        {/* VIEW 6: BUYER DASHBOARD */}
        {activeView === 'buyer' && (
          currentUser ? (
            <BuyerDashboard
              user={currentUser}
              company={currentCompany}
              products={products}
              onLogout={handleLogout}
            />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <h2 className="text-xl font-bold">Sign In Required</h2>
              <p className="text-xs text-slate-600">Please sign in with your approved company credentials to access your buyer dashboard.</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-[#1e1b4b] text-white font-bold text-xs"
              >
                Sign In
              </button>
            </div>
          )
        )}

        {/* VIEW 7: ADMIN PORTAL (Strictly Restricted to Authenticated Owner Admin) */}
        {activeView === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminDashboard
              onLogout={handleLogout}
              products={products}
              onRefreshProducts={loadProducts}
            />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-[#1e1b4b]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Owner Administrator Access Only</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Admin Portal is strictly restricted to the authorized owner administrator of OM RAJPUT TRADING COMPANY.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] text-white font-bold text-xs transition-colors"
              >
                Sign In with Authorized Account
              </button>
            </div>
          )
        )}

      </main>

      {/* Footer */}
      <Footer onNavigate={(v) => setActiveView(v as any)} />

      {/* MODALS */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrderProduct={handleQuickOrder}
      />

      <GSTRegisterModal
        isOpen={gstRegisterOpen}
        onClose={() => setGstRegisterOpen(false)}
        onSuccess={() => {
          setGstRegisterOpen(false);
          setAuthModalOpen(true);
        }}
        onSwitchToLogin={() => {
          setGstRegisterOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={() => {
          setAuthModalOpen(false);
          setGstRegisterOpen(true);
        }}
      />

    </div>
  );
}
