import React from 'react';
import {
  Menu,
  TrendingUp,
  Sun,
  Moon,
  HeartHandshake,
  PhoneCall
} from 'lucide-react';
import type { NavigationTab } from '../../types/navigation';
import type { CotizadorRates } from '../../types/cotizador';
import type { FontSizeMode, ThemeMode } from '../header/AppHeader';

interface AppNavbarProps {
  activeTab: NavigationTab;
  rates: CotizadorRates;
  themeMode: ThemeMode;
  fontSize: FontSizeMode;
  easyMode: boolean;
  onOpenMobileSidebar: () => void;
  onToggleTheme: () => void;
  onSetFontSize: (size: FontSizeMode) => void;
  onToggleEasyMode: () => void;
  onOpenHelpModal: () => void;
  onOpenTutorial?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeTab,
  rates,
  themeMode,
  fontSize,
  easyMode,
  onOpenMobileSidebar,
  onToggleTheme,
  onSetFontSize,
  onToggleEasyMode,
  onOpenHelpModal
}) => {
  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'indicadores':
        return 'Indicadores';
      case 'inventario':
        return 'Inventario';
      case 'pos':
        return 'POS / Ventas';
      case 'reportes':
        return 'Reportes';
      case 'cobranza':
        return 'Cobranza / Fiados';
      case 'configuracion':
        return 'Configuración';
      default:
        return 'Feria Los Cafeteros';
    }
  };

  return (
    <header className="bg-white/80 dark:bg-[#0b1329]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1a294c] sticky top-0 z-30 px-4 py-3 flex items-center justify-between gap-4 transition-colors">
      
      {/* Botón Menú Móvil y Título de Sección */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 md:hidden hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">
            {getTabTitle(activeTab)}
          </h2>
        </div>
      </div>

      {/* Acciones Rápidas y Tasa BCV */}
      <div className="flex items-center gap-2 ml-auto">
        
        {/* Pastilla Limpia de Tasa Oficial BCV */}
        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 px-3 py-1.5 rounded-xl text-xs font-black text-blue-700 dark:text-blue-300 shrink-0">
          <TrendingUp size={14} className="text-blue-500 shrink-0" />
          <span className="hidden sm:inline">BCV:</span>
          <span>{Number(rates?.bcv || 76.5).toFixed(2)} Bs</span>
        </div>

        {/* Botón SOS */}
        <button
          onClick={onOpenHelpModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-transform active:scale-95 shrink-0"
          title="Asistencia / Contacto de Confianza"
        >
          <PhoneCall size={14} />
          <span className="hidden sm:inline">SOS</span>
        </button>

        {/* Selector de Tema Claro / Oscuro */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
          title={themeMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          aria-label="Alternar tema visual"
        >
          {themeMode === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
        </button>

        {/* Selector de Letra */}
        <div className="hidden lg:flex items-center bg-gray-100 dark:bg-slate-800 p-0.5 rounded-xl gap-0.5 text-xs font-bold shrink-0">
          <button
            onClick={() => onSetFontSize('normal')}
            className={`px-2.5 py-1 rounded-lg transition-all ${fontSize === 'normal' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
            title="Texto Normal"
          >
            A
          </button>
          <button
            onClick={() => onSetFontSize('grande')}
            className={`px-2.5 py-1 rounded-lg transition-all ${fontSize === 'grande' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
            title="Texto Grande (+15%)"
          >
            A+
          </button>
          <button
            onClick={() => onSetFontSize('extra')}
            className={`px-2.5 py-1 rounded-lg transition-all ${fontSize === 'extra' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
            title="Texto Gigante (+30%)"
          >
            A++
          </button>
        </div>

        {/* Modo Fácil */}
        <button
          onClick={onToggleEasyMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 cursor-pointer ${
            easyMode
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
          title="Modo Simplificado para Adultos Mayores"
        >
          <HeartHandshake size={14} className={easyMode ? 'text-white' : 'text-pink-500'} />
          <span className="hidden xl:inline">{easyMode ? 'Fácil Activo' : 'Modo Fácil'}</span>
        </button>

      </div>
    </header>
  );
};
