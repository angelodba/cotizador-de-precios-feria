import React from 'react';
import {
  Store,
  Sparkles,
  PhoneCall,
  HelpCircle,
  Sun,
  Moon,
  Type,
  Eye,
  HeartHandshake,
  TrendingUp
} from 'lucide-react';
import type { TasasCambio } from '../../types';

export type FontSizeMode = 'normal' | 'grande' | 'extra';
export type ThemeMode = 'dark' | 'light';

interface AppHeaderProps {
  tasas: TasasCambio;
  themeMode: ThemeMode;
  fontSize: FontSizeMode;
  highContrast: boolean;
  easyMode: boolean;
  onToggleTheme: () => void;
  onSetFontSize: (size: FontSizeMode) => void;
  onToggleHighContrast: () => void;
  onToggleEasyMode: () => void;
  onOpenHelpModal: () => void;
  onOpenTutorial: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  tasas,
  themeMode,
  fontSize,
  highContrast,
  easyMode,
  onToggleTheme,
  onSetFontSize,
  onToggleHighContrast,
  onToggleEasyMode,
  onOpenHelpModal,
  onOpenTutorial
}) => {
  return (
    <header className={`${
      themeMode === 'light'
        ? 'bg-white/90 border-slate-200 shadow-sm'
        : highContrast
          ? 'bg-black border-white/40'
          : 'bg-[#0f172a]/90 border-[#1e3256]'
    } backdrop-blur-xl border-b sticky top-0 z-30 px-3 py-2.5 sm:px-6 flex items-center justify-between flex-wrap gap-2.5 transition-colors`}>
      
      {/* Logo & Marca BodegApp Style */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-950/40 border border-white/20 flex-shrink-0">
          <Store size={22} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight truncate brand-gradient-text">
              FERIA LOS CAFETEROS
            </h1>
            <span className="bg-indigo-500/15 text-indigo-400 dark:text-indigo-300 text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1 shrink-0">
              <Sparkles size={10} />
              <span>POS SAAS</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
            Cotizador Multimoneda • Motor BCV en Tiempo Real • Diseño Inclusivo
          </p>
        </div>
      </div>

      {/* Barra de Accesibilidad, Soporte y Herramientas */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        
        {/* Botón de Ayuda Directa / SOS */}
        <button
          onClick={onOpenHelpModal}
          className="px-3 py-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30 border border-emerald-400/40 min-h-[40px] shrink-0 whitespace-nowrap"
          title="Pedir asistencia directa a soporte o a un familiar"
          aria-label="Abrir menú de ayuda directa"
        >
          <PhoneCall size={15} className="animate-bounce shrink-0" />
          <span>📞 Pedir Ayuda</span>
        </button>

        {/* Botón Guía Visual / Tutorial */}
        <button
          onClick={onOpenTutorial}
          className="px-3 py-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/30 border border-indigo-400/40 min-h-[40px] shrink-0 whitespace-nowrap"
          title="Ver tutorial paso a paso de cómo usar el cotizador"
          aria-label="Ver guía visual de bienvenida"
        >
          <HelpCircle size={15} className="shrink-0" />
          <span className="hidden md:inline">🎓 Guía</span>
        </button>

        {/* Toggle Modo Claro / Modo Oscuro */}
        <button
          onClick={onToggleTheme}
          className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700/80 bg-slate-800/80 hover:bg-slate-750 text-slate-200 hover:text-white min-h-[40px] shrink-0 whitespace-nowrap"
          title={themeMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          aria-label="Cambiar tema visual claro u oscuro"
        >
          {themeMode === 'dark' ? <Sun size={15} className="text-amber-400 shrink-0" /> : <Moon size={15} className="text-indigo-600 shrink-0" />}
          <span className="hidden lg:inline">{themeMode === 'dark' ? 'Claro' : 'Oscuro'}</span>
        </button>

        {/* Selector de Tamaño de Letra */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 p-0.5 rounded-xl gap-0.5 shadow-sm shrink-0" title="Ajustar tamaño de letra">
          <div className="px-1 text-slate-400 hidden sm:flex items-center" aria-hidden="true">
            <Type size={13} />
          </div>
          <button
            onClick={() => onSetFontSize('normal')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all min-h-[32px] flex items-center justify-center ${
              fontSize === 'normal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Texto Normal (16px)"
          >
            A
          </button>
          <button
            onClick={() => onSetFontSize('grande')}
            className={`px-2 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all min-h-[32px] flex items-center justify-center ${
              fontSize === 'grande'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Texto Grande (+15%)"
          >
            A+
          </button>
          <button
            onClick={() => onSetFontSize('extra')}
            className={`px-2 py-1 rounded-lg text-sm font-bold transition-all min-h-[32px] flex items-center justify-center ${
              fontSize === 'extra'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
            title="Texto Gigante (+30%)"
          >
            A++
          </button>
        </div>

        {/* Toggle Alto Contraste */}
        <button
          onClick={onToggleHighContrast}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border min-h-[40px] shadow-sm shrink-0 whitespace-nowrap ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 shadow-yellow-500/20'
              : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/80 text-slate-200 hover:text-white'
          }`}
          title="Activar modo de alto contraste para máxima visibilidad"
          aria-pressed={highContrast}
        >
          <Eye size={15} className="shrink-0" />
          <span className="hidden xl:inline">{highContrast ? 'Contraste Activo' : 'Contraste'}</span>
        </button>

        {/* Toggle Modo Adulto Mayor / Modo Fácil */}
        <button
          onClick={onToggleEasyMode}
          className={`px-3 py-2 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 border min-h-[40px] shadow-sm shrink-0 whitespace-nowrap ${
            easyMode
              ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white border-indigo-400 shadow-indigo-950/40 animate-pulse'
              : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700/80 text-slate-200 hover:text-white'
          }`}
          title="Activa botones gigantes y atajos de un solo toque"
          aria-pressed={easyMode}
        >
          <HeartHandshake size={15} className="text-pink-400 shrink-0" />
          <span>{easyMode ? '👴 Fácil' : '👴 Modo Fácil'}</span>
        </button>

        {/* Widget Tasas del Día BodegApp Style */}
        <div className="flex items-center gap-2 bg-slate-900/90 dark:bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs sm:text-sm shadow-sm min-h-[40px] shrink-0 whitespace-nowrap">
          <TrendingUp size={14} className="text-indigo-400 shrink-0" />
          <span className="text-indigo-300 dark:text-indigo-300 font-extrabold">BCV: {Number(tasas?.tasaBCV || 76.50).toFixed(2)}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-extrabold">COP: {tasas?.tasaCOP || 3850}</span>
        </div>
      </div>
    </header>
  );
};
