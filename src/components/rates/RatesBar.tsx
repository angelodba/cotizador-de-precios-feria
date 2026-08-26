import React from 'react';
import { Clock, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import type { CotizadorRates } from '../../types/cotizador';

interface RatesBarProps {
  rates: CotizadorRates;
  showFormulaSettings: boolean;
  onToggleFormulaSettings: () => void;
  onRateChange: (key: keyof CotizadorRates, value: unknown) => void;
}

export const RatesBar: React.FC<RatesBarProps> = ({
  rates,
  showFormulaSettings,
  onToggleFormulaSettings,
  onRateChange
}) => {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Cabecera de la Barra de Tasas */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Tasas de Mercado & Oficial</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700">
            <Clock size={13} className="text-blue-500" />
            <span>Actualizado: {new Date(rates.lastUpdated || Date.now()).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <button
          onClick={onToggleFormulaSettings}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border min-h-[38px] shadow-sm shrink-0 cursor-pointer ${
            showFormulaSettings
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200'
          }`}
          aria-expanded={showFormulaSettings}
        >
          <SlidersHorizontal size={14} className="shrink-0" />
          <span>Fórmulas de Feria</span>
          {showFormulaSettings ? <ChevronUp size={14} className="shrink-0" /> : <ChevronDown size={14} className="shrink-0" />}
        </button>
      </div>

      {/* Cuadrícula de Tasas Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Tasa BCV */}
        <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5 focus-within:border-blue-500 transition-all shadow-sm">
          <div className="flex items-center justify-between gap-1 text-xs font-bold text-blue-700 dark:text-blue-400">
            <span className="truncate">OFICIAL BCV</span>
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border border-blue-200 dark:border-blue-800">VES/USD</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={rates.bcv}
              onChange={e => onRateChange('bcv', parseFloat(e.target.value))}
              className="w-full min-w-0 bg-transparent text-xl sm:text-2xl font-black text-gray-900 dark:text-white outline-none truncate"
              aria-label="Tasa Oficial BCV"
            />
            <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap shrink-0">Bs./$</span>
          </div>
        </div>

        {/* Tasa COP */}
        <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5 focus-within:border-amber-500 transition-all shadow-sm" title="Tasa para costear compras en Pesos">
          <div className="flex items-center justify-between gap-1 text-xs font-bold text-amber-700 dark:text-amber-400">
            <span className="truncate">COMPRA COP</span>
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border border-amber-200 dark:border-amber-800">COSTO</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="number"
              inputMode="decimal"
              step="10"
              min="1"
              value={rates.cop}
              onChange={e => onRateChange('cop', parseFloat(e.target.value))}
              className="w-full min-w-0 bg-transparent text-xl sm:text-2xl font-black text-gray-900 dark:text-white outline-none truncate"
              aria-label="Tasa de Compra en Pesos Colombianos COP"
            />
            <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0">COP/$</span>
          </div>
        </div>

        {/* Tasa USDT */}
        <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5 focus-within:border-emerald-500 transition-all shadow-sm">
          <div className="flex items-center justify-between gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="truncate">USDT TETHER</span>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border border-emerald-200 dark:border-emerald-800">{rates.usdt > 2.5 ? 'Bs./₮' : '₮/$'}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={rates.usdt}
              onChange={e => onRateChange('usdt', parseFloat(e.target.value))}
              className="w-full min-w-0 bg-transparent text-xl sm:text-2xl font-black text-gray-900 dark:text-white outline-none truncate"
              aria-label="Tasa USDT"
            />
            <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">{rates.usdt > 2.5 ? 'Bs./₮' : '₮/$'}</span>
          </div>
        </div>

        {/* Tasa Paralelo */}
        <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col gap-1.5 focus-within:border-purple-500 transition-all shadow-sm">
          <div className="flex items-center justify-between gap-1 text-xs font-bold text-purple-700 dark:text-purple-400">
            <span className="truncate">PARALELO / REF</span>
            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 border border-purple-200 dark:border-purple-800">PAR/USD</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={rates.paralelo ?? rates.bcv}
              onChange={e => onRateChange('paralelo', parseFloat(e.target.value))}
              className="w-full min-w-0 bg-transparent text-xl sm:text-2xl font-black text-gray-900 dark:text-white outline-none truncate"
              aria-label="Tasa Paralelo Referencial"
            />
            <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap shrink-0">Bs.P/$</span>
          </div>
        </div>
      </div>
    </div>
  );
};
