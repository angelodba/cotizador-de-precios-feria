import React from 'react';
import {
  Printer,
  RotateCcw,
  CreditCard,
  Receipt
} from 'lucide-react';
import type { SaleRecord } from '../../types/navigation';
import type { CotizadorRates } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface ReportesViewProps {
  sales: SaleRecord[];
  rates: CotizadorRates;
  onClearSales: () => void;
  onShowToast: (msg: string) => void;
}

export const ReportesView: React.FC<ReportesViewProps> = ({
  sales,
  rates,
  onClearSales,
  onShowToast
}) => {
  const totalVES = sales.reduce((sum, s) => sum + s.totalVES, 0);
  const totalUSD = sales.reduce((sum, s) => sum + s.totalUSD, 0);

  // Totales por método de pago
  const totalsByMethod = sales.reduce((acc, sale) => {
    acc[sale.metodoPago] = (acc[sale.metodoPago] || 0) + sale.totalVES;
    return acc;
  }, {} as Record<string, number>);

  const handlePrintDailyClose = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* HEADER DE REPORTES BODEGAPP */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Reportes & Cierre de Caja
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Arqueo de ingresos por método de pago y registro de ventas del turno.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintDailyClose}
            className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border border-gray-200 dark:border-slate-700 transition-all min-h-[42px]"
          >
            <Printer size={16} />
            <span>Imprimir Cierre</span>
          </button>

          {sales.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Reiniciar el arqueo de caja para un nuevo turno?')) {
                  onClearSales();
                  onShowToast('🔄 Arqueo de caja reiniciado.');
                }
              }}
              className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border border-red-500/30 transition-all min-h-[42px]"
            >
              <RotateCcw size={16} />
              <span>Nuevo Turno</span>
            </button>
          )}
        </div>
      </header>

      {/* TARJETAS DE ARQUEO TOTAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 border border-indigo-500/50 rounded-2xl p-5 shadow-md text-white flex flex-col justify-between">
          <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
            Total Recaudado (Bs.)
          </span>
          <div className="text-3xl font-black my-2">
            {CotizadorCalculator.formatBCV(totalVES)}
          </div>
          <span className="text-xs text-indigo-300">
            Tasa BCV del día: {rates.bcv} Bs/$
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 border border-emerald-500/50 rounded-2xl p-5 shadow-md text-white flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
            Total Recaudado (USD)
          </span>
          <div className="text-3xl font-black my-2">
            {CotizadorCalculator.formatUSD(totalUSD)}
          </div>
          <span className="text-xs text-emerald-300">
            Total en divisas equivalentes
          </span>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Transacciones Registradas
          </span>
          <div className="text-3xl font-black text-gray-900 dark:text-white my-2">
            {sales.length}
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            Tickets emitidos en el turno
          </span>
        </div>
      </div>

      {/* DESGLOSE POR MÉTODO DE PAGO */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm mb-6">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <CreditCard size={18} className="text-blue-500" />
          <span>Desglose por Vías de Pago</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: 'Pagomovil', label: '🇻🇪 Pago Móvil' },
            { key: 'Cash USD', label: '💵 Efectivo USD' },
            { key: 'Cash VES', label: '🇻🇪 Efectivo Bs' },
            { key: 'Zelle', label: '📱 Zelle' },
            { key: 'COP', label: '🇨🇴 Pesos COP' },
          ].map(method => (
            <div key={method.key} className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-center">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 block truncate">{method.label}</span>
              <span className="text-sm font-black text-gray-900 dark:text-white block mt-1">
                {CotizadorCalculator.formatBCV(totalsByMethod[method.key] || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TABLA DE VENTAS DEL TURNO */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Receipt size={18} className="text-emerald-500" />
          <span>Historial de Tickets Emitidos</span>
        </h2>

        {sales.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">
            Aún no se han registrado ventas en este turno. Las ventas realizadas en el POS aparecerán aquí.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-[#131b2e] text-gray-500 dark:text-slate-400 text-[11px] font-extrabold uppercase">
                <tr>
                  <th className="p-3">ID / Fecha</th>
                  <th className="p-3">Ítems</th>
                  <th className="p-3">Método</th>
                  <th className="p-3 text-right">Total Bs.</th>
                  <th className="p-3 text-right">Total ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-gray-900 dark:text-white">
                      <div>{sale.id}</div>
                      <div className="text-[11px] text-gray-400 font-normal">{sale.fecha}</div>
                    </td>
                    <td className="p-3 text-gray-600 dark:text-slate-300">
                      {sale.itemsCount} {sale.itemsCount === 1 ? 'rubro' : 'rubros'}
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
                        {sale.metodoPago}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                      {CotizadorCalculator.formatBCV(sale.totalVES)}
                    </td>
                    <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {CotizadorCalculator.formatUSD(sale.totalUSD)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
