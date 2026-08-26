import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Sliders,
  Plus,
  Cloud,
  Database
} from 'lucide-react';
import type { CostingTab, TasasCosteo } from '../../types/costing';
import { syncService, type SyncStatusInfo } from '../../services/syncService';

interface MobileBottomNavProps {
  activeTab: CostingTab;
  onSelectTab: (tab: CostingTab) => void;
  onOpenCreateModal: () => void;
  onOpenDatabaseModal: () => void;
  tasas: TasasCosteo;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateModal,
  onOpenDatabaseModal
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(syncService.getStatus());

  useEffect(() => {
    const unsub = syncService.subscribeStatus(s => setSyncStatus(s));
    return unsub;
  }, []);

  return (
    <nav
      className="md:hidden mobile-bottom-nav fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#080d1d]/95 backdrop-blur-xl border-t border-gray-200/90 dark:border-[#1e2b4d]/90 pb-safe pt-1.5 px-2 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] select-none"
      aria-label="Navegación móvil"
    >
      {/* 1. Hoja de Costeo */}
      <button
        type="button"
        onClick={() => onSelectTab('hoja_costeo')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'hoja_costeo'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-medium'
        }`}
        aria-label="Ir a Hoja de Costeo"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'hoja_costeo' ? 'bg-blue-50 dark:bg-blue-950/80' : ''}`}>
          <FileSpreadsheet size={20} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Costeo</span>
      </button>

      {/* 2. Pizarra de Precios */}
      <button
        type="button"
        onClick={() => onSelectTab('pizarra_precios')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'pizarra_precios'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-medium'
        }`}
        aria-label="Ir a Pizarra de Precios"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'pizarra_precios' ? 'bg-blue-50 dark:bg-blue-950/80' : ''}`}>
          <Printer size={20} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Pizarra</span>
      </button>

      {/* 3. Botón Central Prominente: + Saco / Bulto */}
      <div className="flex-1 flex items-center justify-center -mt-5">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-white dark:border-[#080d1d] active:scale-90 transition-transform cursor-pointer"
          title="Ingresar nuevo saco o bulto"
          aria-label="Ingresar nuevo saco o bulto"
        >
          <Plus size={24} strokeWidth={2.8} />
          <span className="text-[9px] font-black leading-none -mt-0.5">Saco</span>
        </button>
      </div>

      {/* 4. Tasas & Ajustes */}
      <button
        type="button"
        onClick={() => onSelectTab('configuracion')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'configuracion'
            ? 'text-blue-600 dark:text-blue-400 font-extrabold'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-medium'
        }`}
        aria-label="Ir a Tasas y Ajustes"
      >
        <div className={`p-1 rounded-xl transition-colors ${activeTab === 'configuracion' ? 'bg-blue-50 dark:bg-blue-950/80' : ''}`}>
          <Sliders size={20} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Tasas BCV</span>
      </button>

      {/* 5. Base de Datos / Supabase Status */}
      <button
        type="button"
        onClick={onOpenDatabaseModal}
        className="flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all cursor-pointer active:scale-95 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-medium relative"
        aria-label="Abrir Base de Datos y Supabase"
      >
        <div className="p-1 rounded-xl relative">
          {syncStatus.state === 'online_synced' ? (
            <Cloud size={20} className="text-emerald-500" />
          ) : syncStatus.state === 'syncing' ? (
            <Database size={20} className="text-blue-500 animate-spin" />
          ) : (
            <Database size={20} />
          )}

          {/* Indicador de estado de conexión */}
          <span
            className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#080d1d] ${
              syncStatus.state === 'online_synced'
                ? 'bg-emerald-500 animate-pulse'
                : syncStatus.state === 'syncing'
                  ? 'bg-blue-500'
                  : syncStatus.state === 'offline_queued'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
            }`}
          />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">
          {syncStatus.state === 'online_synced' ? 'Nube OK' : 'Cloud'}
        </span>
      </button>
    </nav>
  );
};
