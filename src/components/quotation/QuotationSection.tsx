import React from 'react';
import { ShoppingBag, Sparkles, CreditCard, RotateCcw } from 'lucide-react';
import type { CotizadorTotals, CotizadorRates, CotizadorQuoteItem } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';
import { QuotationRow } from './QuotationRow';
import { QuotationSummaryCards } from './QuotationSummaryCards';
import { CommercialActionButtons } from './CommercialActionButtons';

interface QuotationSectionProps {
  quotationData: CotizadorTotals;
  rates: CotizadorRates;
  globalDiscount: number;
  onDiscountChange: (discount: number) => void;
  onUpdateItem: (index: number, updates: Partial<CotizadorQuoteItem>) => void;
  onIncrementItem: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onClearQuote: () => void;
  onOpenPaymentModal: () => void;
  onShareWhatsApp: () => void;
  onPrint: () => void;
  onRegisterSale?: (totalUSD: number, paymentMethod?: 'Pagomovil' | 'Cash USD' | 'Cash VES' | 'Punto de Venta') => void;
  onShowToast: (msg: string) => void;
  highContrast?: boolean;
  mobileTab: 'catalogo' | 'cotizacion' | 'ambos';
}

export const QuotationSection: React.FC<QuotationSectionProps> = ({
  quotationData,
  rates,
  globalDiscount,
  onDiscountChange,
  onUpdateItem,
  onIncrementItem,
  onRemoveItem,
  onClearQuote,
  onOpenPaymentModal,
  onShareWhatsApp,
  onPrint,
  onRegisterSale,
  onShowToast,
  mobileTab
}) => {
  const hasItems = quotationData.items.length > 0;

  return (
    <section className={`xl:col-span-6 bg-white dark:bg-[#0f172a] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-slate-800 transition-all ${
      mobileTab === 'catalogo' ? 'hidden xl:flex' : 'flex'
    }`}>
      
      {/* Cabecera del Carrito / Cotización */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShoppingBag size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Cotización Activa</span>
              <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {quotationData.finalTotals.totalItemsCount} {quotationData.finalTotals.totalItemsCount === 1 ? 'rubro' : 'rubros'}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasItems && (
            <button
              onClick={onOpenPaymentModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 min-h-[38px] cursor-pointer"
            >
              <CreditCard size={15} />
              <span>Cobrar</span>
            </button>
          )}

          {hasItems && (
            <button
              onClick={onClearQuote}
              className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-gray-600 dark:text-slate-300 rounded-xl transition-colors"
              title="Vaciar cotización"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Cotización */}
      {!hasItems ? (
        <div className="bg-gray-50 dark:bg-[#131b2e] border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl py-16 px-4 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-sm">
            🧺
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Tu cotización está vacía
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 max-w-sm">
            Selecciona cualquier verdura o fruta del catálogo para agregarla al cálculo en Bolívares y Dólares.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800 max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[580px]">
              <thead className="bg-gray-50 dark:bg-[#131b2e] text-gray-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Rubro</th>
                  <th className="p-3 text-center">Cantidad</th>
                  <th className="p-3 text-center">Unidad</th>
                  <th className="p-3 text-center" title="Tara a descontar">Tara (Kg)</th>
                  <th className="p-3 text-center">Neto</th>
                  <th className="p-3 text-right">Subtotal Bs.</th>
                  <th className="p-3 text-right">Subtotal ($)</th>
                  <th className="p-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {quotationData.items.map((item, idx) => (
                  <QuotationRow
                    key={`${item.id}-${idx}`}
                    item={item}
                    index={idx}
                    onUpdateItem={onUpdateItem}
                    onIncrementItem={onIncrementItem}
                    onRemoveItem={onRemoveItem}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Descuento Global Limpio */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Descuento:</span>
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="1"
                  value={globalDiscount}
                  onChange={e => onDiscountChange(parseFloat(e.target.value) || 0)}
                  className="w-10 bg-transparent font-black text-amber-600 dark:text-amber-400 text-xs sm:text-sm outline-none text-center"
                />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">%</span>
              </div>
            </div>

            {globalDiscount > 0 && (
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Ahorro: -{CotizadorCalculator.formatUSD(quotationData.discountAmountUSD)}
              </div>
            )}
          </div>

          {/* Tarjetas de Resumen Grandes y Claras */}
          <QuotationSummaryCards
            totalVES={quotationData.finalTotals.totalVES}
            totalUSD={quotationData.finalTotals.totalUSD}
            totalUSDT={quotationData.finalTotals.totalUSDT}
            totalNetKg={quotationData.finalTotals.totalNetKg}
            totalGrossKg={quotationData.finalTotals.totalGrossKg}
            rates={rates}
          />

          {/* Botones de Acción Comercial */}
          <CommercialActionButtons
            onShareWhatsApp={onShareWhatsApp}
            onPrint={onPrint}
            onRegisterSale={onRegisterSale}
            totalUSD={quotationData.finalTotals.totalUSD}
            hasItems={hasItems}
            onShowToast={onShowToast}
          />
        </div>
      )}
    </section>
  );
};
