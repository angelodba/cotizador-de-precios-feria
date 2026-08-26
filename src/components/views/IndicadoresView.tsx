import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  ShoppingBag,
  Layers,
  ArrowRight,
  Calendar
} from 'lucide-react';
import type { CotizadorRates, CotizadorProduct } from '../../types/cotizador';
import type { ClientDebtor, SaleRecord, NavigationTab } from '../../types/navigation';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface IndicadoresViewProps {
  rates: CotizadorRates;
  products: CotizadorProduct[];
  debtors: ClientDebtor[];
  sales: SaleRecord[];
  onNavigateTab: (tab: NavigationTab) => void;
}

export const IndicadoresView: React.FC<IndicadoresViewProps> = ({
  rates,
  products,
  debtors,
  sales,
  onNavigateTab
}) => {
  const totalVentasUSD = sales.reduce((sum, s) => sum + s.totalUSD, 0);
  const totalVentasVES = sales.reduce((sum, s) => sum + s.totalVES, 0);
  const totalDeudaVES = debtors.reduce((sum, d) => sum + d.deudaVES, 0);
  const totalDeudaUSD = debtors.reduce((sum, d) => sum + d.deudaUSD, 0);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* HEADER DE INDICADORES */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Panel de Indicadores
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Resumen en tiempo real de ventas, inventario y cuentas de la feria.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300 shadow-sm">
          <Calendar size={14} className="text-blue-500" />
          <span>{new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </header>

      {/* CUADRÍCULA DE MÉTRICAS BODEGAPP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* 1. Ventas Totales */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Ventas Registradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {CotizadorCalculator.formatBCV(totalVentasVES)}
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {CotizadorCalculator.formatUSD(totalVentasUSD)} ({sales.length} {sales.length === 1 ? 'venta' : 'ventas'})
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 font-medium">
            Acumulado en caja actual
          </div>
        </div>

        {/* 2. Cuentas por Cobrar (Fiados) */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Cuentas por Cobrar
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Wallet size={18} />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 tracking-tight">
              {CotizadorCalculator.formatBCV(totalDeudaVES)}
            </div>
            <div className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-0.5">
              {CotizadorCalculator.formatUSD(totalDeudaUSD)} ({debtors.filter(d => d.deudaVES > 0).length} clientes)
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 font-medium">
            Fiados pendientes de pago
          </div>
        </div>

        {/* 3. Rubros en Inventario */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Rubros en Catálogo
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {products.length}
            </div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              Verduras, Frutas y Víveres
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 font-medium">
            Listos para cotización y pesaje
          </div>
        </div>

        {/* 4. Tasa Oficial BCV */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Tasa Oficial BCV
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {rates.bcv.toFixed(2)} Bs/$
            </div>
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              COP: {rates.cop} COP/$
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-400 font-medium">
            Actualización automática
          </div>
        </div>
      </div>

      {/* ACCESOS DIRECTOS A MÓDULOS DE BODEGAPP */}
      <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3">
        Accesos Rápidos a Módulos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('pos')}
          className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-5 rounded-2xl shadow-md text-left flex flex-col justify-between min-h-[140px] group transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg">POS / Cotizador</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Comenzar a cotizar, pesar y facturar rubros en tiempo real.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('cobranza')}
          className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] hover:border-blue-400 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between min-h-[140px] group transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Cuentas por Cobrar</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Gestionar fiados, clientes deudores y registrar abonos.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('inventario')}
          className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] hover:border-blue-400 p-5 rounded-2xl shadow-sm text-left flex flex-col justify-between min-h-[140px] group transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <ArrowRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div>
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Inventario de Rubros</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Añadir nuevos productos, ajustar costos en COP y márgenes.
            </p>
          </div>
        </button>
      </div>

    </div>
  );
};
