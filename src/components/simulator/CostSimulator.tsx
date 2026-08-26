import React from 'react';
import { Zap, ArrowRight, Plus } from 'lucide-react';
import type { MonedaCostoOrigen } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface CostSimulatorProps {
  simOrigin: MonedaCostoOrigen;
  simCost: number;
  simMarginPct: number;
  simPreview: {
    precioBCV: number;
    precioRefDolarBCV: number;
  };
  onSimOriginChange: (origin: MonedaCostoOrigen) => void;
  onSimCostChange: (cost: number) => void;
  onSimMarginPctChange: (margin: number) => void;
  onOpenCreateProductModal: () => void;
}

export const CostSimulator: React.FC<CostSimulatorProps> = ({
  simOrigin,
  simCost,
  simMarginPct,
  simPreview,
  onSimOriginChange,
  onSimCostChange,
  onSimMarginPctChange,
  onOpenCreateProductModal
}) => {
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm min-w-0 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white truncate">
              Simulador de Costo Origen ➔ PRECIO DÓLAR BCV
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 font-medium truncate">
              Calcula el precio referencial Dólar BCV y precios de venta exactos
            </div>
          </div>
        </div>

        {/* Selector de Moneda de Compra */}
        <div className="flex bg-gray-100 dark:bg-[#131b2e] p-1 rounded-xl border border-gray-200 dark:border-slate-800 gap-1 flex-wrap shrink-0">
          <button
            onClick={() => {
              onSimOriginChange('COP');
              if (simCost < 100) onSimCostChange(90000);
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              simOrigin === 'COP' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
            }`}
          >
            <span>🇨🇴</span>
            <span>En Pesos (COP)</span>
          </button>
          <button
            onClick={() => {
              onSimOriginChange('USD');
              if (simCost > 500) onSimCostChange(1.20);
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              simOrigin === 'USD' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
            }`}
          >
            <span>🇺🇸</span>
            <span>En Dólares ($)</span>
          </button>
          <button
            onClick={() => {
              onSimOriginChange('VES');
              if (simCost > 5000) onSimCostChange(40);
            }}
            className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[36px] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              simOrigin === 'VES' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
            }`}
          >
            <span>🇻🇪</span>
            <span>En Bolívares (Bs)</span>
          </button>
        </div>
      </div>

      {/* Controles de Simulación Interactiva */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-xl min-h-[40px] shrink-0">
            <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 whitespace-nowrap">
              {simOrigin === 'COP' ? 'Costo COP:' : simOrigin === 'USD' ? 'Costo USD ($):' : 'Costo Bs.:'}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={simOrigin === 'COP' ? '1000' : '0.05'}
              value={simCost || ''}
              onChange={e => onSimCostChange(parseFloat(e.target.value) || 0)}
              className="w-24 bg-transparent font-black text-gray-900 dark:text-white text-xs sm:text-sm outline-none"
            />
          </div>

          {simOrigin !== 'COP' && (
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 px-3 py-1.5 rounded-xl min-h-[40px] shrink-0">
              <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 whitespace-nowrap">Margen:</span>
              <input
                type="number"
                inputMode="decimal"
                step="5"
                min="0"
                value={simMarginPct}
                onChange={e => onSimMarginPctChange(parseFloat(e.target.value) || 0)}
                className="w-14 bg-transparent font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm outline-none"
              />
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">%</span>
            </div>
          )}

          <ArrowRight size={16} className="text-gray-400 hidden sm:block shrink-0" />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <div className="bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 px-3.5 py-1.5 rounded-xl shadow-sm min-w-0">
            <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-bold">PRECIO REF. DÓLAR BCV</span>
            <span className="text-sm sm:text-base font-black text-purple-900 dark:text-purple-100">${simPreview.precioRefDolarBCV.toFixed(2)}</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3.5 py-1.5 rounded-xl shadow-sm min-w-0">
            <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-bold">PRECIO VENTA BCV</span>
            <span className="text-sm sm:text-base font-black text-blue-900 dark:text-white">{CotizadorCalculator.formatBCV(simPreview.precioBCV)}</span>
          </div>

          <button
            onClick={onOpenCreateProductModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 min-h-[40px] shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Plus size={15} />
            <span>Crear con este Precio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
