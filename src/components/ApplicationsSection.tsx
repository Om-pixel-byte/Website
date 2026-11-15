import React from 'react';
import {
  Recycle,
  Film,
  PackageOpen,
  Boxes,
  Pipette,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Truck,
  DropletOff,
  Flame,
  FileCheck
} from 'lucide-react';

export const ApplicationsSection: React.FC = () => {
  const industries = [
    {
      title: 'Plastic Recycling & Reclaim Extrusion',
      desc: 'Absorbs volatile moisture trapped in post-industrial and post-consumer regrind. Eliminates steam popping and die buildup.',
      icon: Recycle,
      recommended: 'Royal Desiccant Powder & Gold Magic Powder',
    },
    {
      title: 'Blown Film & Carry Bags (PE / PP)',
      desc: 'Prevents fish-eyes, silver streaks, and bubble rupture on high-speed monolayer and multilayer blown film extrusion lines.',
      icon: Film,
      recommended: 'Shine Addi Desiccant Masterbatch & Filler Masterbatch',
    },
    {
      title: 'Injection & Blow Molding',
      desc: 'Ensures uniform part density and smooth cosmetic finish on plastic containers, automotive parts, and industrial caps.',
      icon: PackageOpen,
      recommended: 'Lime Powder Supreme & Desiccant Masterbatch',
    },
    {
      title: 'HDPE / PP Woven Sacks & Raffia',
      desc: 'Maintains tensile tape strength and eliminates line breakages caused by moisture voids in high-speed loom plants.',
      icon: Boxes,
      recommended: 'Lime Powder White Bull & Royal Desiccant Powder',
    },
    {
      title: 'PVC Pipes, Profiles & Conduits',
      desc: 'Functional mineral reinforcement and moisture scavenging in rigid and flexible PVC compounding recipes.',
      icon: Pipette,
      recommended: 'G.C. Chem Mineral Powder & Red Bull Lime',
    },
    {
      title: 'Rubber & Footwear Sole Compounding',
      desc: 'Controls moisture and acidity during vulcanization and extrusion, preventing blistering on rubber goods and EVA soles.',
      icon: Layers,
      recommended: 'Lime Powder Red Bull & Gold Magic Powder',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/70 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-3">
            <span>INDUSTRIES & APPLICATIONS WE SERVE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Engineered for High-Yield Polymer Processing
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            From film blowing towers in Dadra to plastic recycling plants in Vapi and injection molders in Daman, our additives eliminate moisture-induced defects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-purple-100/90 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#4338ca] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#db2777]" />
                  </div>
                  <h3 className="font-bold text-base text-[#0f172a]">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-medium">Recommended Grade: </span>
                  <span className="font-semibold text-slate-800">{item.recommended}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export const QualitySection: React.FC = () => {
  const pillars = [
    {
      title: 'Hermetic 25.00 KG Dry Packaging',
      desc: 'All desiccant powders and masterbatches are shipped in multi-layer moisture-barrier woven sacks. No hooks are permitted in warehouse handling.',
      icon: DropletOff,
    },
    {
      title: 'Active Chemical Scavenging',
      desc: 'Formulations react endothermically inside the barrel, chemically binding volatile moisture up to 280°C without gas release.',
      icon: Flame,
    },
    {
      title: 'Batch Lot Traceability',
      desc: 'Each bag bears verified Net Wt: 25.00 Kg, Gross Wt: 25.100 Kg, Batch / Lot numbers, and Product of India certification.',
      icon: FileCheck,
    },
    {
      title: 'Zero Overhead Direct Delivery',
      desc: 'Direct B2B supply from Dadra warehouse with physical tax invoices and E-Way Bills uploaded directly to your buyer portal.',
      icon: Truck,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-900 text-xs font-bold mb-3">
            <span>QUALITY ASSURANCE & STANDARDS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
            Why Industrial Buyers Rely on OM RAJPUT TRADING COMPANY
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Industrial materials where every kilogram matters. Our strict quality control ensures zero batch-to-batch variation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-purple-200 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs text-[#1e1b4b] flex items-center justify-center border border-slate-100">
                  <Icon className="w-5 h-5 text-[#db2777]" />
                </div>
                <h4 className="font-bold text-sm text-[#0f172a]">{p.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dadra Guarantee Card */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50/50 to-indigo-50 border border-purple-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b]">
              Local Dadra Warehouse Guarantee
            </div>
            <div className="text-lg font-bold text-[#0f172a]">
              Need Emergency Same-Day Stock for an Active Production Run?
            </div>
            <p className="text-xs text-slate-600">
              Direct factory loading available at Shop No. 2, Survey No. 269, Mahyavanshi Falia, Dadra.
            </p>
          </div>
          <a
            href="tel:+917202007309"
            className="px-6 py-3 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
          >
            Direct Dispatch Line: +91 7202007309
          </a>
        </div>

      </div>
    </section>
  );
};
