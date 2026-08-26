import React from 'react';
import { X, PhoneCall, MessageCircle, Phone, User } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyPhone: string;
  familyName: string;
  onSaveFamilyContact: (name: string, phone: string) => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  familyPhone,
  familyName,
  onSaveFamilyContact
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto text-gray-900 dark:text-white animate-fade-in max-h-[92vh] max-h-[92dvh] overflow-y-auto touch-scroll">
        
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2.5 text-gray-900 dark:text-white">
            <PhoneCall size={20} className="text-emerald-600 dark:text-emerald-400" />
            <span>Asistencia Directa & Soporte</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer active:scale-90"
            aria-label="Cerrar modal de ayuda"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
          Si tienes dudas con los precios, necesitas ayuda para usar el sistema o quieres hablar con un encargado, presiona cualquiera de las opciones:
        </p>

        {/* Botón 1: Soporte Técnico Feria (WhatsApp) */}
        <a
          href="https://api.whatsapp.com/send?phone=584120000000&text=Hola%2C%20necesito%20asistencia%20con%20el%20Cotizador%20de%20la%20Feria%20Los%20Cafeteros"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base p-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-transform active:scale-95 min-h-[48px]"
        >
          <MessageCircle size={20} />
          <span>Contactar Soporte Feria (WhatsApp)</span>
        </a>

        {/* Botón 2: Llamada a Familiar / Encargado de Confianza */}
        <a
          href={`tel:${familyPhone}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base p-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-sm transition-transform active:scale-95 min-h-[48px]"
        >
          <Phone size={20} />
          <span>Llamar a {familyName}</span>
        </a>

        {/* Configurar Contacto de Confianza */}
        <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 rounded-xl p-3.5 flex flex-col gap-2.5 mt-1">
          <div className="text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2">
            <User size={15} className="text-blue-500" />
            <span>Configurar tu Encargado / Familiar de Contacto:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div>
              <label className="text-xs text-gray-600 dark:text-slate-300 font-bold block mb-1">Nombre / Parentesco:</label>
              <input
                type="text"
                value={familyName}
                onChange={e => onSaveFamilyContact(e.target.value, familyPhone)}
                placeholder="Ej. Mi Hijo Juan / Encargado Carlos"
                className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-slate-300 font-bold block mb-1">Número de Teléfono:</label>
              <input
                type="tel"
                value={familyPhone}
                onChange={e => onSaveFamilyContact(familyName, e.target.value)}
                placeholder="Ej. 04121234567"
                className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-gray-900 dark:text-white font-bold outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs sm:text-sm min-h-[42px] mt-1 transition-colors cursor-pointer"
        >
          Cerrar Asistencia
        </button>
      </div>
    </div>
  );
};
