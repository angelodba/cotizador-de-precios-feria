import React from 'react';
import { DollarSign, Scale } from 'lucide-react';
import type { CotizadorRates } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface QuotationSummaryCardsProps {
  totalVES: number;
  totalUSD: number;
  totalUSDT: number;
  totalNetKg: number;
  totalGrossKg: number;
  rates: CotizadorRates;
}

export const QuotationSummaryCards: React.FC<QuotationSummaryCardsProps> = ({
  totalVES,
  totalUSD,
  totalNetKg,
  totalGrossKg,
  rates
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      
      {/* 1. Total Bolívares (Principal de Cobro) */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
          <span>TOTAL BOLÍVARES (BCV)</span>
          <span className="text-base">🇻🇪</span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-blue-900 dark:text-white my-1 tracking-tight truncate" title={CotizadorCalculator.formatBCV(totalVES)}>
          {CotizadorCalculator.formatBCV(totalVES)}
        </div>
        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
          Tasa BCV: {rates.bcv} Bs/$
        </div>
      </div>

      {/* 2. Total Dólares ($) */}
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <span>TOTAL DÓLARES ($)</span>
          <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-white my-1 tracking-tight truncate" title={CotizadorCalculator.formatUSD(totalUSD)}>
          {CotizadorCalculator.formatUSD(totalUSD)}
        </div>
        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
          Equivalente en divisas
        </div>
      </div>

      {/* 3. Peso Facturable */}
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
          <span>PESO NETO</span>
          <Scale size={16} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-white my-1 tracking-tight truncate">
          {CotizadorCalculator.formatWeight(totalNetKg, true)}
        </div>
        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold truncate">
          Bruto: {CotizadorCalculator.formatWeight(totalGrossKg, true)}
        </div>
      </div>

    </div>
  );
};
