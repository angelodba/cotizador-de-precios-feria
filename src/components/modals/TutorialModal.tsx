import React from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface TutorialStepDef {
  title: string;
  icon: React.ReactNode;
  desc: string;
  tip: string;
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: (neverShowAgain?: boolean) => void;
  tutorialStep: number;
  onStepChange: (step: number) => void;
  steps: TutorialStepDef[];
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  tutorialStep,
  onStepChange,
  steps
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl w-full max-w-xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4 my-auto text-gray-900 dark:text-white animate-fade-in">
        
        {/* Header del Tutorial */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Paso {tutorialStep + 1} de {steps.length}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-bold">Guía de Inicio Rápido</span>
          </div>
          <button 
            onClick={() => onClose(false)} 
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Cerrar tutorial"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido del Paso Actual */}
        <div className="flex flex-col items-center text-center gap-3.5 py-2">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700/80 flex items-center justify-center shadow-inner">
            {steps[tutorialStep].icon}
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
            {steps[tutorialStep].title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium max-w-md leading-relaxed">
            {steps[tutorialStep].desc}
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3 text-xs font-medium text-emerald-800 dark:text-emerald-200 max-w-md">
            💡 <strong>Consejo:</strong> {steps[tutorialStep].tip}
          </div>
        </div>

        {/* Indicadores de Pasos (Puntos) */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onStepChange(idx)}
              className={`h-2 rounded-full transition-all ${
                tutorialStep === idx ? 'bg-blue-600 w-7' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 w-2'
              }`}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>

        {/* Botones de Navegación del Tutorial */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
          {tutorialStep > 0 ? (
            <button
              onClick={() => onStepChange(tutorialStep - 1)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white font-bold rounded-xl text-xs sm:text-sm min-h-[42px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Anterior</span>
            </button>
          ) : (
            <button
              onClick={() => onClose(true)}
              className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-xs sm:text-sm font-bold cursor-pointer"
            >
              Saltar Guía
            </button>
          )}

          {tutorialStep < steps.length - 1 ? (
            <button
              onClick={() => onStepChange(tutorialStep + 1)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm min-h-[42px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Siguiente Paso</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => onClose(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm min-h-[42px] flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>¡Entendido, Empezar a Cotizar!</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
