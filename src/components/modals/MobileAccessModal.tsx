import React from 'react';
import { X, Smartphone, QrCode, Wifi, CheckCircle2 } from 'lucide-react';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAccessModal: React.FC<MobileAccessModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in text-gray-900 dark:text-white">
        
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                Acceso Móvil / Teléfono
              </h3>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                Usa el cotizador desde cualquier celular
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-3 p-4 bg-gray-50 dark:bg-[#131b2e] rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex items-center justify-center">
            <QrCode size={120} className="text-gray-900" />
          </div>

          <div className="text-xs font-bold text-gray-700 dark:text-slate-200">
            Escanea con la cámara de tu teléfono
          </div>

          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/40">
            <Wifi size={14} />
            <span>http://192.168.1.50:5173</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1.5">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Funciona sin conexión a internet una vez cargada (PWA instalable).</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Permite cotizar, pesar y compartir por WhatsApp directamente desde el teléfono.</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm min-h-[42px] transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
