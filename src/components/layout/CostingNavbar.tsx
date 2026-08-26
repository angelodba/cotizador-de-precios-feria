import React, { useState, useEffect } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Type,
  PhoneCall,
  Database,
  Cloud
} from 'lucide-react';
import type { CostingTab, TasasCosteo } from '../../types/costing';
import type { FontSizeMode, ThemeMode } from '../header/AppHeader';
import { syncService, type SyncStatusInfo } from '../../services/syncService';

interface CostingNavbarProps {
  activeTab: CostingTab;
  tasas: TasasCosteo;
  theme: ThemeMode;
  fontSize: FontSizeMode;
  onToggleTheme: () => void;
  onCycleFontSize: () => void;
  onOpenMobileMenu: () => void;
  onOpenHelpModal: () => void;
  onOpenDatabaseModal?: () => void;
}

export const CostingNavbar: React.FC<CostingNavbarProps> = ({
  activeTab,
  tasas,
  theme,
  fontSize,
  onToggleTheme,
  onCycleFontSize,
  onOpenMobileMenu,
  onOpenHelpModal,
  onOpenDatabaseModal
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(syncService.getStatus());

  useEffect(() => {
    const unsub = syncService.subscribeStatus(s => setSyncStatus(s));
    return unsub;
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'hoja_costeo':
        return 'Hoja de Costeo & Precios';
      case 'pizarra_precios':
        return 'Pizarra de Precios';
      case 'configuracion':
        return 'Tasas BCV & Ajustes';
      default:
        return 'Pricing & Costeo Feria';
    }
  };

  return (
    <header className="bg-white dark:bg-[#0b1329] border-b border-gray-200 dark:border-[#1e293b] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 pt-safe flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      
      {/* Lado Izquierdo: Menú móvil y Título */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-gray-600 dark:text-slate-300 p-2 -ml-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Abrir menú de navegación"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h2 className="text-xs sm:text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight truncate">
            {getTabTitle()}
          </h2>
          <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-slate-400 font-medium hidden sm:block truncate">
            Feria Los Cafeteros • Sistema Especializado de Costeo
          </div>
        </div>
      </div>

      {/* Lado Derecho: Controles Rápidos */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        
        {/* BOTÓN PROMINENTE DE BASE DE DATOS & SUPABASE CLOUD (Desktop y Móvil) */}
        {onOpenDatabaseModal && (
          <button
            type="button"
            onClick={onOpenDatabaseModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 min-h-[38px] ${
              syncStatus.state === 'online_synced'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                : syncStatus.state === 'syncing'
                  ? 'bg-blue-600 text-white border-blue-700'
                  : syncStatus.state === 'offline_queued'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700'
            }`}
            title="Abrir configuración de Base de Datos y Supabase"
            aria-label="Configurar Base de Datos Supabase"
          >
            {syncStatus.state === 'online_synced' ? (
              <>
                <Cloud size={14} className="shrink-0" />
                <span className="text-[11px] sm:text-xs hidden xs:inline">🟢 Supabase</span>
              </>
            ) : syncStatus.state === 'syncing' ? (
              <>
                <Database size={14} className="animate-spin shrink-0" />
                <span className="text-[11px] sm:text-xs hidden xs:inline">Sync...</span>
              </>
            ) : (
              <>
                <Database size={14} className="shrink-0 text-white" />
                <span className="text-[11px] sm:text-xs hidden xs:inline">☁️ BD</span>
              </>
            )}
          </button>
        )}

        {/* Tasa BCV Pill (Visible en pantallas medianas y grandes) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-xl min-h-[38px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-black text-blue-900 dark:text-blue-200">
            BCV: {tasas.tasaBCV.toFixed(2)} Bs/$
          </span>
        </div>

        {/* SOS / Ayuda */}
        <button
          onClick={onOpenHelpModal}
          className="px-2 sm:px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95 min-h-[38px]"
          title="Asistencia y Soporte Feria"
          aria-label="Asistencia y Soporte"
        >
          <PhoneCall size={14} />
          <span className="hidden sm:inline">Ayuda</span>
        </button>

        {/* Tamaño de Fuente */}
        <button
          onClick={onCycleFontSize}
          className="px-2 sm:px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer active:scale-95 min-h-[38px]"
          title="Cambiar tamaño de letra (A / A+ / A++)"
          aria-label="Cambiar tamaño de letra"
        >
          <Type size={14} />
          <span className="text-[11px] sm:text-xs">{fontSize === 'normal' ? 'A' : fontSize === 'grande' ? 'A+' : 'A++'}</span>
        </button>

        {/* Modo Oscuro / Claro */}
        <button
          onClick={onToggleTheme}
          className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Cambiar tema claro/oscuro"
          aria-label="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
        </button>

      </div>

    </header>
  );
};
