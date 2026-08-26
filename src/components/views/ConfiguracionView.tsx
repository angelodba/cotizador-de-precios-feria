import React from 'react';
import {
  DollarSign,
  Sun,
  Moon,
  Eye,
  HeartHandshake,
  User
} from 'lucide-react';
import type { CotizadorRates, TipoFormulaCOP } from '../../types/cotizador';
import type { FontSizeMode, ThemeMode } from '../header/AppHeader';
import { RatesBar } from '../rates/RatesBar';
import { FormulaSettingsPanel } from '../rates/FormulaSettingsPanel';
import { CostSimulator } from '../simulator/CostSimulator';

interface ConfiguracionViewProps {
  rates: CotizadorRates;
  themeMode: ThemeMode;
  fontSize: FontSizeMode;
  highContrast: boolean;
  easyMode: boolean;
  familyPhone: string;
  familyName: string;
  showFormulaSettings: boolean;
  testFormulaCOP: number;
  testFormulaPreview: {
    precioBCV: number;
    precioCOP: number;
    precioRefDolarBCV: number;
    formulaActivaTexto: string;
  };
  simOrigin: 'COP' | 'USD' | 'VES';
  simCost: number;
  simMarginPct: number;
  simPreview: {
    precioBCV: number;
    precioRefDolarBCV: number;
  };
  onRateChange: (key: keyof CotizadorRates, value: unknown) => void;
  onToggleFormulaSettings: () => void;
  onFormulaTypeChange: (tipo: TipoFormulaCOP) => void;
  onResetFormulaToDefault: () => void;
  onTestFormulaCOPChange: (val: number) => void;
  onSimOriginChange: (origin: 'COP' | 'USD' | 'VES') => void;
  onSimCostChange: (cost: number) => void;
  onSimMarginPctChange: (margin: number) => void;
  onOpenCreateProductModal: () => void;
  onToggleTheme: () => void;
  onSetFontSize: (size: FontSizeMode) => void;
  onToggleHighContrast: () => void;
  onToggleEasyMode: () => void;
  onSaveFamilyContact: (name: string, phone: string) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  rates,
  themeMode,
  fontSize,
  highContrast,
  easyMode,
  familyPhone,
  familyName,
  showFormulaSettings,
  testFormulaCOP,
  testFormulaPreview,
  simOrigin,
  simCost,
  simMarginPct,
  simPreview,
  onRateChange,
  onToggleFormulaSettings,
  onFormulaTypeChange,
  onResetFormulaToDefault,
  onTestFormulaCOPChange,
  onSimOriginChange,
  onSimCostChange,
  onSimMarginPctChange,
  onOpenCreateProductModal,
  onToggleTheme,
  onSetFontSize,
  onToggleHighContrast,
  onToggleEasyMode,
  onSaveFamilyContact
}) => {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
      
      {/* HEADER DE CONFIGURACIÓN BODEGAPP */}
      <header className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Configuración del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Ajustes de tasas de cambio, fórmulas comerciales, accesibilidad y soporte.
        </p>
      </header>

      {/* 1. SECCIÓN: TASAS DE CAMBIO */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign size={18} className="text-blue-500" />
          <span>Tasas de Cambio Oficiales & Mercado</span>
        </h2>

        <RatesBar
          rates={rates}
          showFormulaSettings={showFormulaSettings}
          onToggleFormulaSettings={onToggleFormulaSettings}
          onRateChange={onRateChange}
        />
      </div>

      {/* 2. SECCIÓN: FÓRMULAS DE FERIA COP */}
      {showFormulaSettings && (
        <FormulaSettingsPanel
          rates={rates}
          testFormulaCOP={testFormulaCOP}
          testFormulaPreview={testFormulaPreview}
          onRateChange={onRateChange}
          onFormulaTypeChange={onFormulaTypeChange}
          onResetFormulaToDefault={onResetFormulaToDefault}
          onTestFormulaCOPChange={onTestFormulaCOPChange}
        />
      )}

      {/* 3. SECCIÓN: SIMULADOR DE COSTO ORIGEN */}
      <CostSimulator
        simOrigin={simOrigin}
        simCost={simCost}
        simMarginPct={simMarginPct}
        simPreview={simPreview}
        onSimOriginChange={onSimOriginChange}
        onSimCostChange={onSimCostChange}
        onSimMarginPctChange={onSimMarginPctChange}
        onOpenCreateProductModal={onOpenCreateProductModal}
      />

      {/* 4. SECCIÓN: ACCESIBILIDAD & GERONTOTECNOLOGÍA */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Eye size={18} className="text-purple-500" />
          <span>Accesibilidad & Personalización Visual</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Toggle Tema Claro / Oscuro */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200 block">Tema Visual</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Modo Claro / Modo Oscuro</span>
            </div>
            <button
              onClick={onToggleTheme}
              className="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2 shadow-sm min-h-[38px]"
            >
              {themeMode === 'dark' ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-indigo-500" />}
              <span>{themeMode === 'dark' ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}</span>
            </button>
          </div>

          {/* Selector de Tamaño de Letra */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200 block">Tamaño de Letra</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Normal, Grande (+15%), Extra (+30%)</span>
            </div>
            <div className="flex bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 p-0.5 rounded-xl gap-0.5">
              <button
                onClick={() => onSetFontSize('normal')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg ${fontSize === 'normal' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
              >
                A
              </button>
              <button
                onClick={() => onSetFontSize('grande')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg ${fontSize === 'grande' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
              >
                A+
              </button>
              <button
                onClick={() => onSetFontSize('extra')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg ${fontSize === 'extra' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300'}`}
              >
                A++
              </button>
            </div>
          </div>

          {/* Toggle Alto Contraste */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200 block">Alto Contraste</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Para visibilidad bajo luz solar</span>
            </div>
            <button
              onClick={onToggleHighContrast}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border min-h-[38px] ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-white'
              }`}
            >
              <Eye size={15} />
              <span>{highContrast ? 'Contraste Activo' : 'Activar Contraste'}</span>
            </button>
          </div>

          {/* Modo Fácil */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200 block">Modo Adulto Mayor</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Botones grandes y atajos rápidos</span>
            </div>
            <button
              onClick={onToggleEasyMode}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border min-h-[38px] ${
                easyMode
                  ? 'bg-emerald-600 text-white border-emerald-500 font-black shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-800 dark:text-white'
              }`}
            >
              <HeartHandshake size={15} />
              <span>{easyMode ? 'Modo Fácil Activo' : 'Activar Modo Fácil'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. SECCIÓN: CONTACTO SOS / ENCARGADO */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <User size={18} className="text-emerald-500" />
          <span>Contacto de Confianza / Encargado de Soporte</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div>
            <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Nombre / Parentesco</label>
            <input
              type="text"
              value={familyName}
              onChange={e => onSaveFamilyContact(e.target.value, familyPhone)}
              className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Número de Teléfono</label>
            <input
              type="tel"
              value={familyPhone}
              onChange={e => onSaveFamilyContact(familyName, e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
