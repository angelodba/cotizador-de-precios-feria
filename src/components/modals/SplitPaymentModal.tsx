import React from 'react';
import { X, CreditCard, CheckCircle2 } from 'lucide-react';
import type { CotizadorTotals, CotizadorRates, SplitPaymentsInput, SplitPaymentsResult } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';
import { parseLocaleNumber } from '../../utils/mobileUtils';

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationData: CotizadorTotals;
  rates: CotizadorRates;
  payments: SplitPaymentsInput;
  paymentResult: SplitPaymentsResult;
  onPaymentsChange: (payments: SplitPaymentsInput) => void;
  onRegisterSale?: (totalUSD: number, paymentMethod?: 'Pagomovil' | 'Cash USD' | 'Cash VES' | 'Punto de Venta') => void;
  onShowToast: (msg: string) => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  quotationData,
  rates,
  payments,
  paymentResult,
  onPaymentsChange,
  onRegisterSale,
  onShowToast
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto text-gray-900 dark:text-white animate-fade-in max-h-[92vh] max-h-[92dvh] overflow-y-auto touch-scroll">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold">Desglose de Pago Multimoneda</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Total a Pagar: {CotizadorCalculator.formatUSD(quotationData.finalTotals.totalUSD)} / {CotizadorCalculator.formatBCV(quotationData.finalTotals.totalVES)}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer active:scale-90"
            aria-label="Cerrar modal de desglose de pago"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inputs de Pagos en Múltiples Monedas */}
        <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
          {/* 1. Efectivo USD */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <label className="font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
              <span>💵 Efectivo USD ($):</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              placeholder="0.00"
              value={payments.usdCash || ''}
              onChange={e => onPaymentsChange({ ...payments, usdCash: parseLocaleNumber(e.target.value, 0) })}
              className="w-28 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-right text-emerald-600 dark:text-emerald-400 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* 2. Pago Móvil / Punto Bs */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <label className="font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                <span>🇻🇪 Pago Móvil / Bs:</span>
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Tasa BCV: {rates.bcv}</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="5"
              min="0"
              placeholder="0.00"
              value={payments.bcvPagoMovil || ''}
              onChange={e => onPaymentsChange({ ...payments, bcvPagoMovil: parseLocaleNumber(e.target.value, 0) })}
              className="w-32 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-right text-blue-600 dark:text-blue-400 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* 3. Zelle USD */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <label className="font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
              <span>📱 Zelle ($):</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              placeholder="0.00"
              value={payments.zelleUSD || ''}
              onChange={e => onPaymentsChange({ ...payments, zelleUSD: parseLocaleNumber(e.target.value, 0) })}
              className="w-28 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-right text-purple-600 dark:text-purple-400 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* 4. USDT Tether */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <label className="font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
              <span>₮ USDT Crypto:</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              placeholder="0.00"
              value={payments.usdtCash || ''}
              onChange={e => onPaymentsChange({ ...payments, usdtCash: parseLocaleNumber(e.target.value, 0) })}
              className="w-28 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-right text-emerald-600 dark:text-emerald-400 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* 5. Efectivo COP (Pesos) */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <label className="font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                <span>🇨🇴 Efectivo COP (Pesos):</span>
              </label>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Tasa: {rates.cop}</span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="1000"
              min="0"
              placeholder="0"
              value={payments.copCash || ''}
              onChange={e => onPaymentsChange({ ...payments, copCash: parseLocaleNumber(e.target.value, 0) })}
              className="w-32 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-right text-amber-600 dark:text-amber-400 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Resumen del Estado de Pago */}
        <div className={`p-4 rounded-xl border text-center flex flex-col gap-1 shadow-sm ${
          paymentResult.isFullyPaid
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider">
            Total Pagado: {CotizadorCalculator.formatUSD(paymentResult.totalPaidUSD)} / {CotizadorCalculator.formatUSD(paymentResult.totalDueUSD)}
          </div>

          {paymentResult.isFullyPaid ? (
            <div>
              <div className="font-extrabold text-base sm:text-lg text-emerald-700 dark:text-emerald-300">
                {paymentResult.changeUSD > 0
                  ? `🎉 ¡VUELTO A ENTREGAR: ${CotizadorCalculator.formatUSD(paymentResult.changeUSD)}!`
                  : '✅ PAGO EXACTO CUBIERTO'}
              </div>
              {paymentResult.changeUSD > 0 && (
                <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-bold mt-1">
                  Vuelto: {CotizadorCalculator.formatBCV(paymentResult.changeBCV)} ({CotizadorCalculator.formatUSD(paymentResult.changeUSD)})
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="font-extrabold text-base sm:text-lg text-amber-800 dark:text-amber-300">
                ⏳ PENDIENTE: {CotizadorCalculator.formatUSD(paymentResult.remainingUSD)}
              </div>
              <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-bold mt-1">
                Equivale a: {CotizadorCalculator.formatBCV(paymentResult.remainingVES)}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold min-h-[42px] transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          {paymentResult.isFullyPaid && onRegisterSale && quotationData.finalTotals.totalUSD > 0 && (
            <button
              onClick={() => {
                const method = payments.bcvPagoMovil > 0 ? 'Pagomovil' : 'Cash USD';
                onRegisterSale(quotationData.finalTotals.totalUSD, method);
                onClose();
                onShowToast('✅ ¡Venta registrada con éxito en el Cierre de Caja!');
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all min-h-[42px] cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Confirmar y Registrar Venta</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
