import React from 'react';
import { Share2, Printer, CheckCircle2 } from 'lucide-react';

interface CommercialActionButtonsProps {
  onShareWhatsApp: () => void;
  onPrint: () => void;
  onRegisterSale?: (totalUSD: number, paymentMethod?: 'Pagomovil' | 'Cash USD' | 'Cash VES' | 'Punto de Venta') => void;
  totalUSD: number;
  hasItems: boolean;
  onShowToast: (msg: string) => void;
}

export const CommercialActionButtons: React.FC<CommercialActionButtonsProps> = ({
  onShareWhatsApp,
  onPrint,
  onRegisterSale,
  totalUSD,
  hasItems,
  onShowToast
}) => {
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          onClick={onShareWhatsApp}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 text-xs sm:text-sm min-h-[44px] cursor-pointer"
        >
          <Share2 size={16} />
          <span>Compartir WhatsApp</span>
        </button>

        <button
          onClick={onPrint}
          className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm min-h-[44px] border border-gray-200 dark:border-slate-700 cursor-pointer"
        >
          <Printer size={16} />
          <span>Imprimir Ticket</span>
        </button>
      </div>

      {/* Botón: Registrar Venta directa al sistema */}
      {onRegisterSale && hasItems && (
        <button
          onClick={() => {
            onRegisterSale(totalUSD, 'Cash USD');
            onShowToast('✅ Venta registrada en el arqueo de caja');
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[40px] shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <CheckCircle2 size={16} />
          <span>Registrar Venta en Turno</span>
        </button>
      )}
    </div>
  );
};
