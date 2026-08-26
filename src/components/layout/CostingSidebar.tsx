import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  Settings,
  X,
  Store,
  ChevronRight,
  Cloud
} from 'lucide-react';
import type { CostingTab, TasasCosteo } from '../../types/costing';

interface CostingSidebarProps {
  activeTab: CostingTab;
  onSelectTab: (tab: CostingTab) => void;
  tasas: TasasCosteo;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDatabaseModal?: () => void;
}

export const CostingSidebar: React.FC<CostingSidebarProps> = ({
  activeTab,
  onSelectTab,
  tasas,
  isMobileOpen,
  onCloseMobile,
  onOpenDatabaseModal
}) => {
  const menuItems = [
    {
      id: 'hoja_costeo' as CostingTab,
      label: 'Hoja de Costeo',
      subtitle: 'Costeo de sacos y fijación',
      icon: <FileSpreadsheet size={20} />
    },
    {
      id: 'pizarra_precios' as CostingTab,
      label: 'Pizarra de Precios',
      subtitle: 'Cartelera y WhatsApp',
      icon: <Printer size={20} />
    },
    {
      id: 'configuracion' as CostingTab,
      label: 'Tasas BCV & Ajustes',
      subtitle: 'Valores de cambio y redondeo',
      icon: <Settings size={20} />
    }
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#0b1329] text-white border-r border-[#1e293b] select-none pt-safe pb-safe">
      
      {/* ─── LOGO Y CABECERA DEL SIDEBAR ───────────────────────────────── */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
            <Store size={22} />
          </div>
          <div>
            <h2 className="font-black text-sm tracking-tight text-white leading-tight">
              Feria Los Cafeteros
            </h2>
            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">
              Pricing & Costeo
            </p>
          </div>
        </div>

        {/* Botón cerrar móvil */}
        <button
          onClick={onCloseMobile}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 cursor-pointer"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* ─── MENÚ DE NAVEGACIÓN ────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto touch-scroll">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          Módulos de Costeo
        </div>

        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left font-bold transition-all group min-h-[50px] cursor-pointer active:scale-98 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                  : 'text-slate-300 hover:bg-[#131d38] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-blue-400 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold tracking-tight">{item.label}</div>
                  <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight
                size={14}
                className={`transition-transform shrink-0 ${
                  isActive ? 'text-white translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}

        {/* Botón de Base de Datos y Supabase en el menú lateral */}
        {onOpenDatabaseModal && (
          <div className="pt-3 mt-3 border-t border-[#1e293b]/60">
            <button
              type="button"
              onClick={() => {
                onOpenDatabaseModal();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-left font-bold transition-all bg-gradient-to-r from-blue-950/50 to-indigo-950/50 hover:from-blue-900/60 hover:to-indigo-900/60 border border-blue-900/40 text-blue-200 cursor-pointer shadow-xs active:scale-98 min-h-[48px]"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
                  <Cloud size={16} />
                </span>
                <div>
                  <div className="text-xs font-black text-white">Base de Datos Cloud</div>
                  <div className="text-[10px] text-blue-300">Conectar Supabase</div>
                </div>
              </div>
              <ChevronRight size={14} className="text-blue-400 shrink-0" />
            </button>
          </div>
        )}
      </nav>

      {/* ─── PILL DE TASA OFICIAL BCV ─────────────────────────────────── */}
      <div className="p-4 border-t border-[#1e293b] bg-[#080d1d]">
        <div className="bg-[#101935] border border-[#1e2b4d] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tasa Oficial BCV</div>
              <div className="text-sm font-black text-white">{tasas.tasaBCV.toFixed(2)} Bs/$</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Tasa COP</div>
            <div className="text-xs font-black text-amber-400">{tasas.tasaCOP} COP</div>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Sidebar Escritorio (fijo) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Sidebar Móvil (Drawer con Overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10 animate-slide-in-left shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
