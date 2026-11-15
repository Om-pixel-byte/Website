import React from 'react';
import { Building, MapPin, Truck, Award, CheckCircle, Shield } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-3">
            <span>ABOUT OUR COMPANY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Specialized B2B Supplier of Industrial Moisture Control Additives
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            OM RAJPUT TRADING COMPANY is an established industrial material and plastic manufacturing additive distributor headquartered in Dadra, Dadra & Nagar Haveli.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-5 text-sm text-slate-700 leading-relaxed">
            <p>
              Operating directly at the crossroads of Western India's plastic manufacturing hubs (Dadra, Silvassa, Vapi, and Daman), <strong>OM RAJPUT TRADING COMPANY</strong> sources high-reactivity chemical desiccant powders, calcined lime powders, and masterbatches from leading manufacturers and supplies them directly to plastic processing factories.
            </p>
            <p>
              Under the direct leadership of the business owner, we maintain a streamlined, agile operation with zero bureaucratic overhead. Every shipment of Royal Desiccant Powder, White Bull Lime, Red Bull Lime, Supreme Lime, and Shine Addi Masterbatch is stored under strict humidity controls in our Dadra warehouse.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="font-bold text-slate-900 text-base">Direct Owner Service</div>
                <p className="text-xs text-slate-600 mt-1">
                  Single administrator ownership ensures direct accountability, transparent pricing, and instant dispatch decisions.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-100">
                <div className="font-bold text-slate-900 text-base">Palletized Dadra Stock</div>
                <p className="text-xs text-slate-600 mt-1">
                  Ready buffer inventory maintained in 25.00 KG sealed bags for same-day local factory pickups and fast transport.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] text-white p-8 sm:p-10 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                <div>
                  <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                    Location Advantage
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1">
                    At the Heart of India's Polymer Industrial Belt
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                    <span>
                      Shop No. 2, Survey No. 269, Mahyavanshi Falia, Dadra, Village Dadra (D. & N.H.) 396193
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
                    <span>
                      Daily road dispatch connectivity across Dadra, Silvassa, Vapi GIDC, Daman, Sarigam, and Tarapur MIDC.
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Full GST Compliance: Verified registered B2B buyers receive official tax invoices and E-Way Bills with every dispatch.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span>Contact: +91 7202007309</span>
                  <span className="text-pink-300 font-bold">Dadra (D.&N.H.) 396193</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
