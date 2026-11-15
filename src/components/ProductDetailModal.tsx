import React from 'react';
import {
  X,
  Package,
  ShieldCheck,
  CheckCircle2,
  Factory,
  Layers,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { Product } from '../types/index.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOrderProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOrderProduct,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              OM RAJPUT TRADING COMPANY
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          
          {/* Top section: Photo + Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Product Image */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-purple-100 bg-slate-100 aspect-4/3 md:aspect-square">
              <img
                src={product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-lg">
                Actual Warehouse Photograph
              </div>
            </div>

            {/* Product Title & Executive Summary */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                  {product.name}
                </h2>
                <p className="text-sm text-[#4338ca] font-semibold mt-1">
                  Industrial Material Specification · Dadra Supply
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.detailedDesc}
              </p>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100/80 text-xs">
                <div>
                  <span className="block text-slate-500 font-medium">Physical Form</span>
                  <span className="font-bold text-slate-900">{product.physicalForm}</span>
                </div>
                <div>
                  <span className="block text-slate-500 font-medium">Standard Packaging</span>
                  <span className="font-bold text-slate-900">{product.packaging}</span>
                </div>
              </div>

              {/* Order button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOrderProduct(product);
                  }}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#1e1b4b] to-[#4338ca] text-white font-bold text-sm shadow-md hover:from-[#312e81] hover:to-[#db2777] transition-all flex items-center justify-center space-x-2"
                >
                  <span>Place Order for {product.name}</span>
                  <ArrowRight className="w-4 h-4 text-pink-400" />
                </button>
              </div>
            </div>

          </div>

          {/* How It Works & Chemical Mechanism */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b] flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#db2777]" />
              <span>How the Product Works in Polymer Processing</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {product.howItWorks}
            </p>
          </div>

          {/* Benefits & Industrial Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Benefits */}
            <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b] flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Manufacturing Benefits</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {product.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Industrial Applications */}
            <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e1b4b] flex items-center space-x-1.5">
                <Factory className="w-4 h-4 text-indigo-600" />
                <span>Target Industrial Applications</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {product.applications.map((app, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Verified Technical Specifications Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-purple-600" />
                <span>Verified Technical Specifications</span>
              </h4>
              <span className="text-[11px] text-slate-500 italic">
                *Unspecified parameters marked as "Contact us for details"
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600 uppercase tracking-wider">
                      Manufacturer Verified Specification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Object.entries(product.technicalSpecs).map(([key, value]) => (
                    <tr key={key} className="hover:bg-purple-50/30">
                      <td className="px-4 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                        {key}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">
                        {value === 'Contact us for details' ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                            Contact us for details
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Storage & Handling Information */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Storage, Warehousing & Handling Guidelines:</span>
              <p className="mt-1 text-amber-800 leading-relaxed">
                {product.storageHandling}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Supplier: <strong className="text-slate-800">OM RAJPUT TRADING COMPANY</strong> · Dadra, India
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOrderProduct(product);
              }}
              className="px-5 py-2 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] text-white text-xs font-bold shadow-xs transition-colors"
            >
              Proceed to Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
