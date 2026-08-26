import React from 'react';
import { Pencil, Plus } from 'lucide-react';
import type { CotizadorProduct, UnitConversionDef } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface ProductCardProps {
  product: CotizadorProduct;
  prices: {
    baseUSD: number;
    precioRefDolarBCV: number;
    precioBCV: number;
    precioCOP: number;
    precioUSDT: number;
  };
  unitDef?: UnitConversionDef;
  quickPresets: { label: string; value: number }[];
  onAdd: (product: CotizadorProduct, amount?: number) => void;
  onEdit: (product: CotizadorProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  prices,
  unitDef,
  quickPresets,
  onAdd,
  onEdit
}) => {
  return (
    <div className="bg-gray-50 dark:bg-[#131b2e] hover:bg-white dark:hover:bg-[#16223b] border border-gray-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group">
      
      {/* Información del Rubro y Precios */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          {product.icono || '🥬'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold text-gray-900 dark:text-white truncate" title={product.nombre}>
            {product.nombre}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
            por {unitDef?.shortLabel || product.unidadDefecto}
          </div>

          {/* Precios Claros y Visibles */}
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
              {CotizadorCalculator.formatBCV(prices.precioBCV)}
            </span>
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700">
              ${prices.precioRefDolarBCV.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas y Ergonómicas */}
      <div className="mt-3 pt-2.5 border-t border-gray-200/80 dark:border-slate-800 flex flex-col gap-2">
        {/* Pesajes Rápidos */}
        <div className="grid grid-cols-4 gap-1">
          {quickPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => onAdd(product, preset.value)}
              className="bg-white dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-slate-300 text-[11px] font-bold py-1 px-0.5 rounded-lg border border-gray-200 dark:border-slate-700 transition-all min-h-[32px] flex items-center justify-center active:scale-95 cursor-pointer"
              title={`Añadir ${preset.label}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          <button 
            onClick={() => onEdit(product)}
            className="col-span-1 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-xl flex items-center justify-center transition-all min-h-[38px] border border-gray-200 dark:border-slate-700 cursor-pointer"
            title="Editar Rubro"
            aria-label={`Editar ${product.nombre}`}
          >
            <Pencil size={15} />
          </button>
          
          <button 
            onClick={() => onAdd(product)}
            className="col-span-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 min-h-[38px] shadow-sm cursor-pointer"
            title="Agregar a la cotización"
          >
            <Plus size={16} />
            <span>+ Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
