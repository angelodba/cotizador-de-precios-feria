import React from 'react';
import {
  Store,
  TrendingUp,
  LayoutGrid,
  ShoppingCart,
  PieChart,
  Wallet,
  Settings,
  Smartphone,
  PhoneCall,
  Menu,
  X
} from 'lucide-react';
import type { NavigationTab } from '../../types/navigation';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenHelpModal: () => void;
  onOpenMobileQR: () => void;
  debtorsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  onOpenHelpModal,
  onOpenMobileQR,
  debtorsCount = 0
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }> = [
    {
      id: 'indicadores',
      label: 'Indicadores',
      icon: <TrendingUp size={20} className="shrink-0" />
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: <LayoutGrid size={20} className="shrink-0" />
    },
    {
      id: 'pos',
      label: 'POS / Ventas',
      icon: <ShoppingCart size={20} className="shrink-0" />
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <PieChart size={20} className="shrink-0" />
    },
    {
      id: 'cobranza',
      label: 'Cobranza / Fiados',
      icon: <Wallet size={20} className="shrink-0" />,
      badge: debtorsCount > 0 ? debtorsCount : undefined
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: <Settings size={20} className="shrink-0" />
    }
  ];

  return (
    <>
      {/* Overlay Oscuro para Móviles */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-[#0b1329] text-slate-100 flex flex-col border-r border-[#1a294c] transition-all duration-300 ease-in-out shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Cabecera del Sidebar con Logo BodegApp */}
        <div className="p-4 border-b border-[#1a294c] flex items-center justify-between min-h-[72px]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-950/60 shrink-0 border border-blue-400/30">
              <Store size={22} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <h2 className="text-lg font-black text-white tracking-tight truncate flex items-center gap-1.5">
                  <span className="text-blue-400">Mi</span>
                  <span>bodega</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-medium block truncate">
                  Sistema de Gestión
                </span>
              </div>
            )}
          </div>

          {/* Botón Collapse (Desktop) y Cerrar (Móvil) */}
          <div className="flex items-center">
            <button
              onClick={onCloseMobile}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 md:hidden"
              aria-label="Cerrar menú lateral"
            >
              <X size={20} />
            </button>

            <button
              onClick={onToggleCollapse}
              className="hidden md:flex text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
              title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
              aria-label="Alternar tamaño de menú lateral"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Lista de Enlaces de Navegación */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 text-left group min-h-[46px] ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/60 border border-blue-400/40 translate-x-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <span className="truncate flex-1">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white text-blue-700' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-[#1a294c] flex flex-col gap-1.5 mt-auto bg-[#080d1a]/50">
          <button
            onClick={onOpenMobileQR}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Acceso Móvil / Conectar teléfono"
          >
            <Smartphone size={18} className="text-slate-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Acceso Móvil</span>}
          </button>

          <button
            onClick={onOpenHelpModal}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors border border-transparent hover:border-emerald-500/30"
            title="Asistencia y Soporte Directo"
          >
            <PhoneCall size={18} className="text-emerald-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Asistencia SOS</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
