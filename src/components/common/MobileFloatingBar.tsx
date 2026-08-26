import React from 'react';
import { ShoppingBag, Share2 } from 'lucide-react';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface MobileFloatingBarProps {
  totalItemsCount: number;
  totalVES: number;
  totalUSD: number;
  onOpenQuotation: () => void;
  onShareWhatsApp: () => void;
}

export const MobileFloatingBar: React.FC<MobileFloatingBarProps> = ({
  totalItemsCount,
  totalVES,
  totalUSD,
  onOpenQuotation,
  onShareWhatsApp
}) => {
  if (totalItemsCount === 0) return null;

  return (
    <div className="xl:hidden fixed bottom-4 inset-x-3 sm:inset-x-6 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-fade-in text-gray-900 dark:text-white">
      <div className="flex flex-col">
        <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">
          Carrito ({totalItemsCount} {totalItemsCount === 1 ? 'ítem' : 'ítems'})
        </div>
        <div className="text-base sm:text-lg font-black text-gray-900 dark:text-white flex items-center gap-1.5">
          <span className="text-blue-600 dark:text-blue-400">{CotizadorCalculator.formatBCV(totalVES)}</span>
          <span className="text-xs text-gray-500 dark:text-slate-400 font-bold">({CotizadorCalculator.formatUSD(totalUSD)})</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQuotation}
          className="px-3.5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex items-center gap-1.5 transition-all min-h-[40px] whitespace-nowrap cursor-pointer"
        >
          <ShoppingBag size={15} />
          <span>Ver Carrito</span>
        </button>
        <button
          onClick={onShareWhatsApp}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-1.5 transition-all min-h-[40px] whitespace-nowrap cursor-pointer"
        >
          <Share2 size={15} />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
