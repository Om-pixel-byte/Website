import React from 'react';
import { Package, ArrowUpRight, Shield, CheckCircle, Info } from 'lucide-react';
import { Product } from '../types/index.ts';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onOrderProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onOrderProduct,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group hover:border-purple-200">
      {/* Product Image Box */}
      <div
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-[#1e1b4b] border border-purple-100 shadow-2xs">
            {product.category}
          </span>
        </div>

        {/* 25 KG indicator */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#1e1b4b]/90 text-white shadow-2xs backdrop-blur-xs flex items-center space-x-1">
            <Package className="w-3 h-3 text-pink-400" />
            <span>25.00 KG</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-lg text-[#0f172a] group-hover:text-[#4338ca] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {product.shortDesc}
          </p>

          {/* Quick bullet points */}
          <div className="mt-3 space-y-1">
            {product.benefits.slice(0, 2).map((benefit, bIdx) => (
              <div key={bIdx} className="flex items-start space-x-1.5 text-[11px] text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging & Form Specs */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Physical Form:</span>
            <span className="font-semibold text-slate-800 text-right line-clamp-1 max-w-[170px]">
              {product.physicalForm}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Packaging:</span>
            <span className="font-semibold text-slate-800 text-right line-clamp-1">
              {product.packaging}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 text-[#1e1b4b] font-bold text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>Details</span>
            <Info className="w-3.5 h-3.5 text-purple-600" />
          </button>
          <button
            onClick={() => onOrderProduct(product)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#1e1b4b] hover:bg-[#312e81] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>Add to Order</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-pink-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
