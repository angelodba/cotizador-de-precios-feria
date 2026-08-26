import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Calculator,
  Check,
  RotateCcw,
  Zap,
  Wrench,
  X,
  Plus,
  Trash2,
  Layers,
  PlusCircle,
  Coins,
  Cloud,
  Database,
  Search,
  TrendingUp,
  Sun
} from 'lucide-react';
import type {
  TasasCosteo,
  FormulaPersonalizadaCosteo,
  CategoriaDef,
  PasoFormulaCustom,
  OperadorPasoFormula,
  VariableEntradaFormula,
  ItemCosteo,
  TipoValorPaso,
  TasaPersonalizadaDef
} from '../../types/costing';
import type { FontSizeMode } from '../header/AppHeader';
import { CostingCalculator } from '../../utils/costingCalculator';
import { parseLocaleNumber } from '../../utils/mobileUtils';
import { CSV_DEFAULT_BASE_PRICES_USDT, DEFAULT_CATEGORIES } from '../../utils/initialCostingData';

interface CostingConfiguracionViewProps {
  tasas: TasasCosteo;
  fontSize: FontSizeMode;
  highContrast: boolean;
  items?: ItemCosteo[];
  customCategories?: CategoriaDef[];
  onUpdateTasas: (newTasas: Partial<TasasCosteo>, showToastFeedback?: boolean) => void;
  onFontSizeChange: (size: FontSizeMode) => void;
  onToggleHighContrast: () => void;
  onAddCategory?: (category: CategoriaDef) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onOpenDatabaseModal?: () => void;
  onShowToast: (msg: string) => void;
}

export const CostingConfiguracionView: React.FC<CostingConfiguracionViewProps> = ({
  tasas,
  fontSize,
  highContrast,
  items = [],
  customCategories = DEFAULT_CATEGORIES,
  onUpdateTasas,
  onFontSizeChange,
  onToggleHighContrast,
  onAddCategory,
  onDeleteCategory,
  onOpenDatabaseModal,
  onShowToast
}) => {
  const [testCustomVal, setTestCustomVal] = useState<number>(90000);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatEmoji, setNewCatEmoji] = useState<string>('🏷️');
  const [searchBasePrice, setSearchBasePrice] = useState<string>('');

  // Formulario para nueva tasa personalizada
  const [isAddingCustomRate, setIsAddingCustomRate] = useState<boolean>(false);
  const [newRateName, setNewRateName] = useState<string>('');
  const [newRateValue, setNewRateValue] = useState<number>(92.00);
  const [newRateEmoji, setNewRateEmoji] = useState<string>('💵');

  const currentBasePrices = tasas.preciosBaseUSDT || CSV_DEFAULT_BASE_PRICES_USDT;
  const customRatesList: TasaPersonalizadaDef[] = tasas.tasasPersonalizadas || [];

  const formulaConfig: FormulaPersonalizadaCosteo = tasas.formulaPersonalizada || {
    variableEntrada: 'costo_origen_empaque',
    monedaResultado: 'VES',
    pasos: [
      { id: 'p-1', nombre: 'Paso 1: Divisor Compra', op: 'div', val: 3200, tipoValor: 'divisor_cop_usdt', activo: true },
      { id: 'p-2', nombre: 'Paso 2: Margen Feria', op: 'mul', val: 880, tipoValor: 'factor_margen', activo: true },
      { id: 'p-3', nombre: 'Paso 3: Divisa Feria', op: 'div', val: 787, tipoValor: 'tasa_divisa_bcv', activo: true }
    ]
  };

  const pasosList: PasoFormulaCustom[] = (formulaConfig.pasos && formulaConfig.pasos.length > 0)
    ? formulaConfig.pasos
    : [
        { id: 'p-1', nombre: 'Paso 1: Base Entrada', op: formulaConfig.op1 || 'div', val: typeof formulaConfig.val1 === 'number' ? formulaConfig.val1 : 3200, tipoValor: 'divisor_cop_usdt', activo: true },
        { id: 'p-2', nombre: 'Paso 2: Factor Margen', op: formulaConfig.op2 || 'mul', val: typeof formulaConfig.val2 === 'number' ? formulaConfig.val2 : 880, tipoValor: 'factor_margen', activo: true },
        { id: 'p-3', nombre: 'Paso 3: Factor Divisa', op: formulaConfig.op3 || 'div', val: typeof formulaConfig.val3 === 'number' ? formulaConfig.val3 : (formulaConfig.monedaResultado === 'USD' ? 1 : 787), tipoValor: formulaConfig.monedaResultado === 'USD' ? 'manual' : 'tasa_divisa_bcv', activo: true }
      ];

  const handleUpdateFormulaConfig = (updated: Partial<FormulaPersonalizadaCosteo>) => {
    const newCfg: FormulaPersonalizadaCosteo = {
      ...formulaConfig,
      ...updated
    };
    onUpdateTasas({
      formulaPersonalizada: newCfg
    });
  };

  const handleUpdatePaso = (id: string, updatedPaso: Partial<PasoFormulaCustom>) => {
    const nextPasos = pasosList.map(p => p.id === id ? { ...p, ...updatedPaso } : p);
    handleUpdateFormulaConfig({ pasos: nextPasos });
  };

  const handleAddPaso = () => {
    const newId = `p-${Date.now()}`;
    const newPaso: PasoFormulaCustom = {
      id: newId,
      nombre: `Paso ${pasosList.length + 1}`,
      op: 'mul',
      val: 1,
      tipoValor: 'manual',
      activo: true
    };
    handleUpdateFormulaConfig({ pasos: [...pasosList, newPaso] });
    onShowToast('➕ Nuevo paso agregado al constructor.');
  };

  const handleDeletePaso = (id: string) => {
    if (pasosList.length <= 1) {
      onShowToast('⚠️ La fórmula debe tener al menos 1 paso.');
      return;
    }
    const nextPasos = pasosList.filter(p => p.id !== id);
    handleUpdateFormulaConfig({ pasos: nextPasos });
    onShowToast('🗑️ Paso eliminado de la fórmula.');
  };

  const handleAddCustomRate = () => {
    if (!newRateName.trim()) {
      onShowToast('⚠️ Ingresa un nombre para la tasa personalizada.');
      return;
    }
    const newRate: TasaPersonalizadaDef = {
      id: `tasa-custom-${Date.now()}`,
      nombre: newRateName.trim(),
      valor: Math.max(0.01, Number(newRateValue) || 1),
      icono: newRateEmoji.trim() || '💵',
      tipo: 'bs_por_dolar'
    };
    const updatedList = [...customRatesList, newRate];
    onUpdateTasas({ tasasPersonalizadas: updatedList });
    setNewRateName('');
    setNewRateValue(92.00);
    setIsAddingCustomRate(false);
    onShowToast(`✅ Tasa "${newRate.nombre}" (${newRate.valor} Bs/$) agregada.`);
  };

  const handleUpdateCustomRateValue = (id: string, newVal: number) => {
    const updatedList = customRatesList.map(r => r.id === id ? { ...r, valor: newVal } : r);
    onUpdateTasas({ tasasPersonalizadas: updatedList });
  };

  const handleDeleteCustomRate = (id: string) => {
    const updatedList = customRatesList.filter(r => r.id !== id);
    onUpdateTasas({ tasasPersonalizadas: updatedList });
    onShowToast('🗑️ Tasa personalizada eliminada.');
  };

  const handleUpdateProductBasePrice = (prodName: string, newPriceUSDT: number) => {
    const updated = {
      ...currentBasePrices,
      [prodName]: newPriceUSDT
    };
    onUpdateTasas({ preciosBaseUSDT: updated });
    onShowToast(`💾 Precio base de ${prodName} actualizado a $${newPriceUSDT.toFixed(2)} USDT.`);
  };

  const handleResetCSVFormulas = () => {
    onUpdateTasas({
      tasaBCV: 76.50,
      tasaParalelo: 95.00,
      tasaProveedor: 92.00,
      tasaUSDT: 94.00,
      tasaCOP: 3850,
      tasaCompraCOP_USDT: 3200,
      factorMargenCOP: 880,
      tasaDivisaBCV: 787,
      tipoFormula: 'formula_feria_3factores',
      formulaPersonalizada: {
        variableEntrada: 'costo_origen_empaque',
        monedaResultado: 'VES',
        pasos: [
          { id: 'p-1', nombre: 'Paso 1: Divisor Compra', op: 'div', val: 3200, tipoValor: 'divisor_cop_usdt', activo: true },
          { id: 'p-2', nombre: 'Paso 2: Margen Feria', op: 'mul', val: 880, tipoValor: 'factor_margen', activo: true },
          { id: 'p-3', nombre: 'Paso 3: Divisa Feria', op: 'div', val: 787, tipoValor: 'tasa_divisa_bcv', activo: true }
        ],
        op1: 'div',
        val1: 3200,
        op2: 'mul',
        val2: 880,
        op3: 'div',
        val3: 787
      },
      preciosBaseUSDT: CSV_DEFAULT_BASE_PRICES_USDT
    });
    onShowToast('🔄 Fórmulas, tasas y precios base del archivo CSV restaurados.');
  };

  // Simulación en tiempo real de la fórmula personalizada con el Constructor Total
  const customSim = CostingCalculator.evaluateCustomFormula(
    testCustomVal,
    {
      ...formulaConfig,
      pasos: pasosList
    },
    tasas.tasaBCV,
    tasas.tipoRedondeoBCV,
    tasas.tasaCOP,
    tasas
  );

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-28 sm:pb-8 overflow-y-auto max-w-5xl mx-auto w-full gap-5 sm:gap-6 touch-scroll">
      
      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Fórmulas de Costeo & Ajustes</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Motor matemático multi-moneda con soporte para fijación de precios y tasas personalizadas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetCSVFormulas}
          className="px-3.5 py-2 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Restablecer Parámetros Base</span>
        </button>
      </div>

      {/* ─── BANNER PRINCIPAL DE BASE DE DATOS Y CONEXIÓN A SUPABASE ──── */}
      {onOpenDatabaseModal && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-blue-400/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                Base de Datos & Sincronización en la Nube (Supabase)
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Conecta PostgreSQL para respaldar tus costos y sincronizar tus precios en vivo en tu teléfono y tablet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDatabaseModal}
            className="px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-900 font-black text-xs sm:text-sm rounded-xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Cloud size={16} className="text-blue-600" />
            <span>Abrir Configuración Supabase</span>
          </button>
        </div>
      )}

      {/* ─── 2. SELECTOR DE ESTRATEGIA DE FÓRMULA ───────────────────── */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calculator size={16} />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Estrategia de Fórmula para Fijar Precios</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Selecciona la regla matemática activa para fijar los precios de venta en bolívares y dólares.
              </p>
            </div>
          </div>

          {items && items.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                🌐 {items.filter(i => !i.tipoFormulaItem || i.tipoFormulaItem === 'heredar_global').length} con fórmula global
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                🛠️ {items.filter(i => i.tipoFormulaItem && i.tipoFormulaItem !== 'heredar_global').length} con fórmula exclusiva
              </span>
            </div>
          )}
        </div>

        {/* 4 Opciones de Estrategia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Opción 1: Fórmula Directa Feria */}
          <button
            type="button"
            onClick={() => onUpdateTasas({ tipoFormula: 'formula_feria_3factores' }, true)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
              (tasas.tipoFormula || 'formula_feria_3factores') === 'formula_feria_3factores'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 shadow-sm text-blue-900 dark:text-blue-100'
                : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-black text-xs sm:text-sm">
              <span>🌟 Fórmula Directa Feria</span>
              {(tasas.tipoFormula || 'formula_feria_3factores') === 'formula_feria_3factores' && (
                <Check size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed font-mono">
              [Costo COP] ÷ {tasas.tasaCompraCOP_USDT || 3.2} ÷ [Kilos] ÷ BCV = $ USD/Kg & Bs/Kg
            </p>
          </button>

          {/* Opción 2: Precio Directo en Dólares */}
          <button
            type="button"
            onClick={() => onUpdateTasas({ tipoFormula: 'formula_csv_usdt' }, true)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
              tasas.tipoFormula === 'formula_csv_usdt'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 shadow-sm text-blue-900 dark:text-blue-100'
                : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-black text-xs sm:text-sm">
              <span>💵 Precio Directo en $ USD</span>
              {tasas.tipoFormula === 'formula_csv_usdt' && (
                <Check size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed font-mono">
              Precio Fijado ($/Kg) × Tasa BCV = Bs/Kg
            </p>
          </button>

          {/* Opción 3: Margen Porcentual % */}
          <button
            type="button"
            onClick={() => onUpdateTasas({ tipoFormula: 'margen_porcentaje' }, true)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
              tasas.tipoFormula === 'margen_porcentaje'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 shadow-sm text-blue-900 dark:text-blue-100'
                : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-black text-xs sm:text-sm">
              <span>📈 Margen Porcentual %</span>
              {tasas.tipoFormula === 'margen_porcentaje' && (
                <Check size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed font-mono">
              [Costo Real USD/Kg] + Margen %
            </p>
          </button>

          {/* Opción 4: Constructor Total Personalizado */}
          <button
            type="button"
            onClick={() => onUpdateTasas({ tipoFormula: 'formula_personalizada' }, true)}
            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
              tasas.tipoFormula === 'formula_personalizada'
                ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 shadow-sm text-purple-900 dark:text-purple-100'
                : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-black text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <Wrench size={15} className="text-purple-600 dark:text-purple-400" />
                <span>Constructor Multi-Paso</span>
              </span>
              {tasas.tipoFormula === 'formula_personalizada' && (
                <Check size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] opacity-80 leading-relaxed font-mono">
              Constructor encadenado y multi-moneda
            </p>
          </button>

        </div>

        {/* ─── ESTRATEGIA 1: FÓRMULA DIRECTA FERIA ──── */}
        {(tasas.tipoFormula || 'formula_feria_3factores') === 'formula_feria_3factores' && (
          <div className="bg-amber-50/40 dark:bg-[#131b2e] border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-6 flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
                  <Sun size={13} />
                  <span>Estrategia Activa: Fórmula Directa Feria</span>
                </span>
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mt-1">
                  [Costo Saco COP] ÷ Divisor (3.2) ÷ Factor Divisa (787) ÷ Kilos (22) = $1.80 USD/Kg
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Convierte el costo del saco en pesos a dólares mediante el divisor y factor de cambio feria, divide entre los kilos del empaque y calcula el costo exacto por kilo.
                </p>
              </div>
            </div>

            {/* Ajuste del Divisor COP y Factor Divisa */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col gap-1.5">
                <label className="text-xs font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                  1. Divisor COP (Feria)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.10"
                    value={tasas.tasaCompraCOP_USDT || 3.2}
                    onChange={e => {
                      const val = parseLocaleNumber(e.target.value, 0);
                      onUpdateTasas({ tasaCompraCOP_USDT: val });
                    }}
                    onBlur={() => {
                      if (!tasas.tasaCompraCOP_USDT || tasas.tasaCompraCOP_USDT <= 0) {
                        onUpdateTasas({ tasaCompraCOP_USDT: 3.2 });
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-base text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-bold text-gray-400">Divisor</span>
                </div>
                <span className="text-[10px] text-gray-500">Ejemplo: 3.2 (100.000 COP ÷ 3.2 = 31.250)</span>
              </div>

              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col gap-1.5">
                <label className="text-xs font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider">
                  2. Factor Divisa Feria
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    value={tasas.tasaDivisaBCV || 787}
                    onChange={e => {
                      const val = parseLocaleNumber(e.target.value, 0);
                      onUpdateTasas({ tasaDivisaBCV: val });
                    }}
                    onBlur={() => {
                      if (!tasas.tasaDivisaBCV || tasas.tasaDivisaBCV <= 0) {
                        onUpdateTasas({ tasaDivisaBCV: 787 });
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-base text-gray-900 dark:text-white outline-none focus:border-purple-500"
                  />
                  <span className="text-xs font-bold text-gray-400">Factor</span>
                </div>
                <span className="text-[10px] text-gray-500">Ejemplo: 787 (31.250 ÷ 787 = $39.70 USD)</span>
              </div>

              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-xs flex flex-col gap-1.5 justify-between">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    3. Tasa Oficial BCV
                  </label>
                  <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                    {tasas.tasaBCV.toFixed(2)} Bs/$
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  El precio en dólares ($/Kg) se multiplica por esta tasa oficial para obtener la cotización en Bolívares.
                </p>
              </div>
            </div>

            {/* Simulador en Vivo del Caso Real (Ejemplo Tomates) */}
            <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍅</span>
                  <div>
                    <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                      Demostración en Vivo: Saco de 22 Kg a 100.000 COP
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                      (100.000 ÷ {tasas.tasaCompraCOP_USDT || 3.2}) ÷ {tasas.tasaDivisaBCV || 787} ÷ 22 Kg = $1.80 USD/Kg
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Costo en Dólares</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      $1.80 USD / Kg
                    </span>
                  </div>
                  <div className="text-right border-l border-gray-200 dark:border-slate-700 pl-3">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Costo en Bolívares</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {CostingCalculator.formatVES(CostingCalculator.roundCommercialBCV(1.80 * tasas.tasaBCV, tasas.tipoRedondeoBCV))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pasos Matemáticos */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="bg-gray-50 dark:bg-[#131b2e] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">1. Divisor COP</span>
                  <div className="font-black text-sm text-gray-900 dark:text-white mt-0.5">
                    31.250
                  </div>
                  <span className="text-[10px] text-gray-400">100.000 ÷ {tasas.tasaCompraCOP_USDT || 3.2}</span>
                </div>

                <div className="bg-gray-50 dark:bg-[#131b2e] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">2. Costo Total Saco</span>
                  <div className="font-black text-sm text-purple-600 dark:text-purple-400 mt-0.5">
                    $39.70 USD
                  </div>
                  <span className="text-[10px] text-gray-400">31.250 ÷ {tasas.tasaDivisaBCV || 787}</span>
                </div>

                <div className="bg-gray-50 dark:bg-[#131b2e] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">3. Costo por Kilo</span>
                  <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    $1.80 USD / Kg
                  </div>
                  <span className="text-[10px] text-gray-400">$39.70 ÷ 22 Kg</span>
                </div>

                <div className="bg-gray-50 dark:bg-[#131b2e] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">4. Costo en Bolívares</span>
                  <div className="font-black text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                    {CostingCalculator.formatVES(CostingCalculator.roundCommercialBCV(1.80 * tasas.tasaBCV, tasas.tipoRedondeoBCV))}
                  </div>
                  <span className="text-[10px] text-gray-400">$1.80 × {tasas.tasaBCV.toFixed(2)} BCV</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── ESTRATEGIA 2: PRECIO DIRECTO EN DÓLARES ($/Kg) ────────── */}
        {tasas.tipoFormula === 'formula_csv_usdt' && (
          <div className="bg-blue-50/40 dark:bg-[#131b2e] border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
                  <Coins size={13} />
                  <span>Estrategia Activa: Precio Directo en $ USD</span>
                </span>
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mt-1">
                  Precio Fijado en Dólares ($/Kg) × Tasa BCV
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Ajusta directamente el precio en dólares por kilo para cada rubro. El precio en bolívares se calcula con la Tasa Oficial BCV.
                </p>
              </div>

              {/* Buscador de Precios */}
              <div className="relative min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchBasePrice}
                  onChange={e => setSearchBasePrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Tabla de Precios Base en USD */}
            <div className="overflow-x-auto bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-slate-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 dark:bg-[#131b2e] text-gray-500 dark:text-slate-400 text-[11px] font-extrabold uppercase border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Producto</th>
                    <th className="p-3 text-center">Precio Fijado ($ USD/Kg)</th>
                    <th className="p-3 text-right">Precio BCV (Bs.)</th>
                    <th className="p-3 text-right">Precio COP (Pesos)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
                  {Object.entries(currentBasePrices)
                    .filter(([prodName]) => !searchBasePrice || prodName.toLowerCase().includes(searchBasePrice.toLowerCase()))
                    .map(([prodName, baseUSDT]) => {
                      const bcvPrice = CostingCalculator.roundCommercialBCV(baseUSDT * tasas.tasaBCV, tasas.tipoRedondeoBCV);
                      const copPrice = Math.round(baseUSDT * tasas.tasaCOP / 100) * 100;
                      return (
                        <tr key={prodName} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-bold text-gray-900 dark:text-white">
                            {prodName}
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-gray-200 dark:border-slate-700">
                              <span className="text-xs font-bold text-gray-400">$</span>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.10"
                                min="0.10"
                                value={baseUSDT}
                                onChange={e => handleUpdateProductBasePrice(prodName, parseLocaleNumber(e.target.value, 0))}
                                className="w-14 bg-transparent text-center font-black text-sm text-gray-900 dark:text-white outline-none"
                              />
                              <span className="text-[10px] font-bold text-blue-500">USD</span>
                            </div>
                          </td>
                          <td className="p-3 text-right font-black text-emerald-700 dark:text-emerald-400 text-sm">
                            {CostingCalculator.formatVES(bcvPrice)}
                          </td>
                          <td className="p-3 text-right font-bold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                            {CostingCalculator.formatCOP(copPrice)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ESTRATEGIA 3: MARGEN PORCENTUAL % ──────────────────────── */}
        {tasas.tipoFormula === 'margen_porcentaje' && (
          <div className="bg-emerald-50/40 dark:bg-[#131b2e] border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-6 flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
                  <TrendingUp size={13} />
                  <span>Estrategia Activa: Margen Porcentual Tradicional %</span>
                </span>
                <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mt-1">
                  [Costo Real USD/Kg] + Margen % = Precio Venta
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Calcula el precio sumando un porcentaje exacto de rentabilidad sobre el costo unitario de compra (descontando merma y sumando flete).
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-sm text-gray-900 dark:text-white">
                  Margen Comercial de los Rubros
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Cada rubro puede tener su propio margen individual (ej: Papa 30%, Tomate 35%, Ajo 40%), o puedes ajustarlo desde la Hoja de Costeo.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-gray-400">Márgenes típicos:</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">25%</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">30%</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">35%</span>
                <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">40%</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── ESTRATEGIA 4: CONSTRUCTOR TOTAL DE FÓRMULAS & SIMULADOR MATEMÁTICO ─── */}
        {tasas.tipoFormula === 'formula_personalizada' && (
          <div className="bg-purple-50/40 dark:bg-[#131b2e] border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4 sm:p-6 flex flex-col gap-5 animate-fade-in">
            
            {/* Header del Constructor Total con Presets */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-purple-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Layers size={13} />
                    <span>Constructor Total de Fórmulas</span>
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">
                    Motor Matemático Multi-Tasas y Multi-Moneda
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Permite compras en Bolívares (VES), Pesos (COP) y Dólares a cualquier tasa personalizada o del sistema.
                </p>
              </div>

              {/* Plantillas Rápidas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mr-1">Plantillas:</span>
                
                {/* Preset Universal */}
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateFormulaConfig({
                      variableEntrada: 'costo_origen_kilo',
                      monedaResultado: 'VES',
                      pasos: [
                        { id: 'p-1', nombre: 'Paso 1: Margen de Ganancia', op: 'percent_add', val: 35, tipoValor: 'manual', activo: true }
                      ]
                    });
                    onShowToast('🌐 Plantilla Universal (Origen Kilo + 35% ➔ Salida Bs) cargada.');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#0f172a] border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors cursor-pointer"
                >
                  🌐 Universal Automática
                </button>

                {/* Preset Feria Oficial */}
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateFormulaConfig({
                      variableEntrada: 'costo_bulto_cop',
                      monedaResultado: 'VES',
                      pasos: [
                        { id: 'p-1', nombre: 'Paso 1: Divisor Compra', op: 'div', val: 3200, tipoValor: 'divisor_cop_usdt', activo: true },
                        { id: 'p-2', nombre: 'Paso 2: Margen Feria', op: 'mul', val: 880, tipoValor: 'factor_margen', activo: true },
                        { id: 'p-3', nombre: 'Paso 3: Divisa Feria', op: 'div', val: 787, tipoValor: 'tasa_divisa_bcv', activo: true }
                      ]
                    });
                    onShowToast('🌟 Plantilla Feria Oficial (3 Factores COP ➔ Bs) cargada.');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#0f172a] border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors cursor-pointer"
                >
                  🌟 Feria (COP ➔ Bs)
                </button>

                {/* Preset Bolívares */}
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateFormulaConfig({
                      variableEntrada: 'costo_kilo_ves',
                      monedaResultado: 'VES',
                      pasos: [
                        { id: 'p-1', nombre: 'Paso 1: Margen Comercial', op: 'percent_add', val: 30, tipoValor: 'manual', activo: true }
                      ]
                    });
                    onShowToast('🇻🇪 Plantilla Compra en Bolívares (Kilo Bs + 30%) cargada.');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#0f172a] border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors cursor-pointer"
                >
                  🇻🇪 Bolívares + Margen
                </button>

                {/* Preset Dólar Paralelo a Dólar BCV */}
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateFormulaConfig({
                      variableEntrada: 'costo_kilo_usd_paralelo',
                      monedaResultado: 'VES',
                      pasos: [
                        { id: 'p-1', nombre: 'Paso 1: Margen Ganancia', op: 'percent_add', val: 30, tipoValor: 'manual', activo: true },
                        { id: 'p-2', nombre: 'Paso 2: Tasa BCV Oficial', op: 'mul', val: tasas.tasaBCV, tipoValor: 'tasa_bcv', activo: true }
                      ]
                    });
                    onShowToast('📈 Plantilla Dólar Paralelo ➔ Salida Bs BCV cargada.');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-[#0f172a] border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                >
                  📈 Dólar Paralelo ➔ Bs
                </button>
              </div>
            </div>

            {/* ─── PARÁMETROS GENERALES: VARIABLE DE ENTRADA Y MONEDA DE SALIDA ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Selector de Variable de Entrada Multi-Moneda y Multi-Tasa */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-xs flex flex-col gap-2">
                <label className="text-xs font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Variable de Inicio de la Fórmula</span>
                  <span className="text-[10px] text-purple-600 font-mono font-bold">Multi-Moneda & Tasas Vzla</span>
                </label>
                <select
                  value={formulaConfig.variableEntrada || 'costo_origen_empaque'}
                  onChange={e => {
                    handleUpdateFormulaConfig({ variableEntrada: e.target.value as VariableEntradaFormula });
                    onShowToast(`📥 Variable de inicio: ${CostingCalculator.getVariableEntradaLabel(e.target.value as VariableEntradaFormula)}`);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 cursor-pointer"
                >
                  <optgroup label="🔄 Variable Universal Inteligente (Recomendada)">
                    <option value="costo_origen_empaque">🔄 [Costo Origen Bulto] - Moneda nativa del rubro (COP, USD o VES)</option>
                    <option value="costo_origen_kilo">🔄 [Costo Origen Kilo] - Moneda nativa del rubro por kilo</option>
                  </optgroup>

                  <optgroup label="🇨🇴 Compras en Pesos Colombianos (COP)">
                    <option value="costo_bulto_cop">🇨🇴 [Costo Bulto COP] - Costo total de compra en Pesos</option>
                    <option value="costo_kilo_cop">🇨🇴 [Costo Kilo COP] - Costo unitario por kilo en Pesos</option>
                  </optgroup>

                  <optgroup label="🇻🇪 Compras en Bolívares (VES)">
                    <option value="costo_bulto_ves">🇻🇪 [Costo Bulto Bs. VES] - Monto total en Bolívares</option>
                    <option value="costo_kilo_ves">🇻🇪 [Costo Kilo Bs. VES] - Costo unitario por kilo en Bolívares</option>
                  </optgroup>

                  <optgroup label="🇺🇸 Compras en Dólares Fijos / Base (USD)">
                    <option value="costo_bulto_usd">🇺🇸 [Costo Bulto USD Base] - Dólar base / efectivo</option>
                    <option value="costo_kilo_usd">🇺🇸 [Costo Kilo USD Base] - Dólar base por kilo</option>
                  </optgroup>

                  <optgroup label="📈 Dólares a Diferentes Tasas de Venezuela">
                    <option value="costo_bulto_usd_bcv">🇻🇪 [Costo Bulto USD @ BCV] - Valorado a Tasa Oficial BCV</option>
                    <option value="costo_kilo_usd_bcv">🇻🇪 [Costo Kilo USD @ BCV] - Valorado a Tasa Oficial BCV</option>
                    <option value="costo_bulto_usd_paralelo">📈 [Costo Bulto USD @ Paralelo] - Valorado a Dólar Paralelo / Monitor</option>
                    <option value="costo_kilo_usd_paralelo">📈 [Costo Kilo USD @ Paralelo] - Valorado a Dólar Paralelo / Monitor</option>
                    <option value="costo_bulto_usd_proveedor">🤝 [Costo Bulto USD @ Proveedor] - Valorado a Tasa Proveedor / Reposición</option>
                    <option value="costo_kilo_usd_proveedor">🤝 [Costo Kilo USD @ Proveedor] - Valorado a Tasa Proveedor / Reposición</option>
                  </optgroup>

                  <optgroup label="📊 Matriz CSV Histórica">
                    <option value="precio_base_usdt">📊 [Precio Base CSV USDT] - Valor de referencia de la matriz</option>
                  </optgroup>
                </select>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                  {formulaConfig.variableEntrada === 'costo_origen_empaque' || formulaConfig.variableEntrada === 'costo_origen_kilo'
                    ? '✨ Modo inteligente: Toma automáticamente la moneda en que se compró cada rubro (COP, USD o Bs).'
                    : 'El cálculo matemático iniciará tomando este valor exacto como punto de partida.'}
                </span>
              </div>

              {/* Selector de Moneda de Salida */}
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 shadow-xs flex flex-col gap-2">
                <label className="text-xs font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between">
                  <span>2. Moneda de Salida del Precio Final</span>
                  <span className="text-[10px] text-gray-400 font-mono">Resultado</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-purple-100/70 dark:bg-[#131b2e] p-1 rounded-xl border border-purple-200 dark:border-purple-800">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateFormulaConfig({ monedaResultado: 'VES' });
                      onShowToast('🇻🇪 Salida fijada en Bolívares Oficiales (Bs. BCV).');
                    }}
                    className={`p-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      formulaConfig.monedaResultado !== 'USD' && formulaConfig.monedaResultado !== 'COP'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-900 dark:text-purple-300 hover:text-purple-700'
                    }`}
                  >
                    <span>🇻🇪 Bs. BCV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateFormulaConfig({ monedaResultado: 'USD' });
                      onShowToast('🇺🇸 Salida fijada en Dólares ($ USD).');
                    }}
                    className={`p-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      formulaConfig.monedaResultado === 'USD'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-purple-900 dark:text-purple-300 hover:text-purple-700'
                    }`}
                  >
                    <span>🇺🇸 $ USD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateFormulaConfig({ monedaResultado: 'COP' });
                      onShowToast('🇨🇴 Salida fijada en Pesos Colombianos (COP).');
                    }}
                    className={`p-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      formulaConfig.monedaResultado === 'COP'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-purple-900 dark:text-purple-300 hover:text-purple-700'
                    }`}
                  >
                    <span>🇨🇴 COP</span>
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                  El sistema convertirá automáticamente el resultado a las demás monedas (USD ⇄ Bs ⇄ COP).
                </span>
              </div>

            </div>

            {/* ─── LISTA DINÁMICA DE PASOS DE LA FÓRMULA ─── */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator size={15} />
                  <span>3. Pasos Matemáticos Encadenados ({pasosList.length} {pasosList.length === 1 ? 'paso' : 'pasos'})</span>
                </span>
                <span className="text-[11px] text-gray-500 dark:text-slate-400">
                  Permite números manuales o vincular directamente a las tasas del sistema o personalizadas.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {pasosList.map((paso, index) => {
                  const resolved = CostingCalculator.resolveStepValue(paso, tasas);
                  const isZeroDivision = paso.op === 'div' && resolved.val === 0 && paso.activo;

                  return (
                    <div
                      key={paso.id}
                      className={`bg-white dark:bg-[#0f172a] rounded-2xl p-4 border transition-all flex flex-col gap-3 shadow-xs relative ${
                        isZeroDivision
                          ? 'border-red-500 ring-2 ring-red-400/30'
                          : paso.activo
                            ? 'border-purple-200 dark:border-purple-900/60'
                            : 'border-gray-200 dark:border-slate-800 opacity-60 bg-gray-50/50'
                      }`}
                    >
                      {/* Cabecera del Paso */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-black flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={paso.nombre || `Paso ${index + 1}`}
                            onChange={e => handleUpdatePaso(paso.id, { nombre: e.target.value })}
                            placeholder={`Paso ${index + 1}`}
                            className="bg-transparent font-bold text-xs text-gray-900 dark:text-white outline-none border-b border-transparent focus:border-purple-400 w-full"
                          />
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Toggle Activo / Inactivo */}
                          <button
                            type="button"
                            onClick={() => handleUpdatePaso(paso.id, { activo: !paso.activo })}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase transition-colors cursor-pointer ${
                              paso.activo
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                            }`}
                          >
                            {paso.activo ? 'Activo' : 'Omitido'}
                          </button>

                          {/* Eliminar Paso */}
                          <button
                            type="button"
                            onClick={() => handleDeletePaso(paso.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Eliminar paso"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Tipo de Valor / Vinculación a Tasas */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 block mb-1">
                          Origen del Valor de este Paso:
                        </label>
                        <select
                          value={paso.tipoValor || 'manual'}
                          onChange={e => {
                            const newTipo = e.target.value as TipoValorPaso;
                            handleUpdatePaso(paso.id, { tipoValor: newTipo });
                          }}
                          className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2 text-xs font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <optgroup label="Valores Manuales">
                            <option value="manual">🔢 Número manual fijo</option>
                          </optgroup>

                          <optgroup label="Tasas del Sistema">
                            <option value="tasa_bcv">🇻🇪 Tasa Oficial BCV ({tasas.tasaBCV.toFixed(2)})</option>
                            <option value="tasa_paralelo">📈 Dólar Paralelo ({tasas.tasaParalelo || 95.00})</option>
                            <option value="tasa_proveedor">🤝 Tasa Proveedor ({tasas.tasaProveedor || 92.00})</option>
                            <option value="tasa_usdt">💵 Dólar USDT ({tasas.tasaUSDT || 94.00})</option>
                            <option value="tasa_cop">🇨🇴 Tasa Pesos COP ({tasas.tasaCOP || 3850})</option>
                            <option value="divisor_cop_usdt">Divisor CSV COP/USDT ({tasas.tasaCompraCOP_USDT || 3200})</option>
                            <option value="factor_margen">Factor Margen Feria ({tasas.factorMargenCOP || 880})</option>
                            <option value="tasa_divisa_bcv">Tasa Divisa Feria ({tasas.tasaDivisaBCV || 787})</option>
                          </optgroup>

                          {customRatesList.length > 0 && (
                            <optgroup label="Tus Tasas Personalizadas">
                              {customRatesList.map(cr => (
                                <option key={cr.id} value={cr.id}>
                                  {cr.icono || '💵'} {cr.nombre} ({cr.valor})
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      {/* Operador y Valor Numérico */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 block mb-1">
                            Operación:
                          </label>
                          <select
                            value={paso.op}
                            onChange={e => handleUpdatePaso(paso.id, { op: e.target.value as OperadorPasoFormula })}
                            className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2 text-xs font-black text-gray-900 dark:text-white outline-none min-h-[40px] cursor-pointer"
                          >
                            <option value="div">÷ Dividir entre</option>
                            <option value="mul">× Multiplicar por</option>
                            <option value="add">+ Sumar valor</option>
                            <option value="sub">- Restar valor</option>
                            <option value="percent_add">+% Sumar margen</option>
                            <option value="percent_sub">-% Restar desc.</option>
                            <option value="none">⚪ Omitir (Neutro)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 block mb-1">
                            {paso.tipoValor && paso.tipoValor !== 'manual' ? 'Valor Dinámico:' : 'Valor Numérico:'}
                          </label>
                          {paso.tipoValor && paso.tipoValor !== 'manual' ? (
                            <div className="w-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl p-2 text-xs font-black text-purple-900 dark:text-purple-200 min-h-[40px] flex items-center justify-center text-center">
                              {resolved.label}
                            </div>
                          ) : (
                            <input
                              type="number"
                              inputMode="decimal"
                              step="any"
                              value={paso.val === 0 ? '0' : paso.val}
                              onChange={e => {
                                const num = parseLocaleNumber(e.target.value, 0);
                                handleUpdatePaso(paso.id, { val: num });
                              }}
                              placeholder="0"
                              className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-purple-500 min-h-[40px]"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón para Agregar Más Pasos */}
              <button
                type="button"
                onClick={handleAddPaso}
                className="w-full py-3 bg-white dark:bg-[#0f172a] hover:bg-purple-50 dark:hover:bg-purple-950/40 border-2 border-dashed border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <Plus size={16} />
                <span>+ Agregar Nuevo Paso a la Fórmula</span>
              </button>
            </div>

            {/* ─── BANNER DE NOTACIÓN MATEMÁTICA EN VIVO ─── */}
            <div className="bg-purple-100/70 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Ecuación Matemática Resultante:
                </span>
                <code className="font-mono text-xs sm:text-sm font-black text-purple-950 dark:text-purple-100 bg-white/90 dark:bg-[#080d1a] px-3 py-1 rounded-lg border border-purple-300 dark:border-purple-700 shadow-xs">
                  {customSim.formulaText}
                </code>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300">
                <span>Salida: <strong>{formulaConfig.monedaResultado === 'USD' ? '$ USD' : formulaConfig.monedaResultado === 'COP' ? 'Pesos COP' : 'Bs. BCV'}</strong></span>
                <span>•</span>
                <span>Redondeo: <strong>{tasas.tipoRedondeoBCV === 'entero' ? 'Entero' : tasas.tipoRedondeoBCV === 'multiplo_5' ? 'Múltiplo de 5' : 'Exacto'}</strong></span>
              </div>
            </div>

            {/* ─── SIMULADOR & ANÁLISIS MATEMÁTICO PASO A PASO EN VIVO ─── */}
            <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    <span>Simulador y Análisis Matemático de Resolución en Vivo</span>
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Observa cómo se evalúa cada paso secuencialmente desde el valor de entrada hasta los precios finales en todas las monedas.
                  </p>
                </div>

                {/* Botones de Prueba Rápida */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400">Probar con:</span>
                  <button
                    type="button"
                    onClick={() => setTestCustomVal(90000)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    🇨🇴 Papa (90.000 COP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestCustomVal(25)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    🇺🇸 Ajo ($25 USD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestCustomVal(1200)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    🇻🇪 Maíz (1.200 Bs.)
                  </button>
                </div>
              </div>

              {/* Input de Valor de Prueba */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 dark:bg-[#131b2e] p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
                <label className="text-xs font-black text-gray-800 dark:text-slate-200 uppercase tracking-wider shrink-0">
                  Valor de Prueba de Entrada:
                </label>
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={testCustomVal}
                    onChange={e => setTestCustomVal(parseLocaleNumber(e.target.value, 0))}
                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 font-black text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
                  />
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 shrink-0">
                    {formulaConfig.variableEntrada?.includes('cop') ? 'COP' : formulaConfig.variableEntrada?.includes('usd') ? 'USD' : formulaConfig.variableEntrada?.includes('ves') ? 'Bs. VES' : 'Unidades'}
                  </span>
                </div>
              </div>

              {/* Flujo de Resolución Paso a Paso en Tarjetas */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Resolución Paso a Paso:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {/* Punto de Inicio */}
                  <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Inicio: Entrada</div>
                    <div className="text-base font-black text-gray-900 dark:text-white my-1">
                      {testCustomVal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold truncate">
                      {CostingCalculator.getVariableEntradaLabel(formulaConfig.variableEntrada || 'costo_origen_empaque')}
                    </div>
                  </div>

                  {/* Pasos calculados */}
                  {customSim.pasosDetallados.map(pd => (
                    <div
                      key={pd.indice}
                      className={`border rounded-xl p-3 flex flex-col justify-between ${
                        pd.esDivisionPorCero
                          ? 'bg-red-50 dark:bg-red-950/60 border-red-300'
                          : pd.activo
                            ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60'
                            : 'bg-gray-100/50 dark:bg-slate-900/50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                        <span>Paso {pd.indice}</span>
                        <span>{pd.simbolo} {pd.etiquetaValor || pd.valorPaso}</span>
                      </div>
                      <div className="text-base font-black text-gray-900 dark:text-white my-1">
                        {pd.esDivisionPorCero ? (
                          <span className="text-red-600 text-xs font-bold">Indefinido (0)</span>
                        ) : (
                          pd.valorResultado.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 font-medium truncate">
                        {pd.nombre}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matriz Multimoneda Simultánea */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="bg-gray-50 dark:bg-[#131b2e] p-3 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">🇻🇪 Bolívares (Bs. BCV)</span>
                    <div className="text-base font-black text-purple-700 dark:text-purple-300">
                      {CostingCalculator.formatVES(customSim.precioBCV)}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">BCV: {tasas.tasaBCV.toFixed(2)}</span>
                </div>

                <div className="bg-gray-50 dark:bg-[#131b2e] p-3 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">🇺🇸 Dólares ($ USD)</span>
                    <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
                      ${customSim.precioUSD.toFixed(2)} USD / Kg
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">USDT: 1.00</span>
                </div>

                <div className="bg-gray-50 dark:bg-[#131b2e] p-3 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">🇨🇴 Pesos Colombianos</span>
                    <div className="text-base font-black text-amber-600 dark:text-amber-400">
                      {CostingCalculator.formatCOP(customSim.precioCOP)}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">COP: {tasas.tasaCOP.toLocaleString('es-CO')}</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ─── GESTIÓN DE CATEGORÍAS Y RUBROS PERSONALIZADOS ────────────── */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <span>🏷️ Gestión de Categorías y Servicios Personalizados</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Crea nuevas categorías y clasificaciones para rubros, insumos, mano de obra o fletes.
            </p>
          </div>
        </div>

        {/* Lista de Categorías */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {customCategories.map(cat => (
            <div
              key={cat.id || cat.nombre}
              className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{cat.icono || '🏷️'}</span>
                <span className="font-bold text-xs truncate text-gray-900 dark:text-white">
                  {cat.nombre}
                </span>
              </div>
              {cat.esPersonalizada && onDeleteCategory ? (
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat.id)}
                  className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors"
                  title="Eliminar categoría personalizada"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-slate-800">
                  Base
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Formulario Agregar Nueva Categoría */}
        {onAddCategory && (
          <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              maxLength={4}
              value={newCatEmoji}
              onChange={e => setNewCatEmoji(e.target.value)}
              placeholder="Emoji"
              className="w-16 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-center text-sm outline-none"
            />
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Nombre de nueva categoría (ej. Lácteos, Granos, Envasado...)"
              className="flex-1 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-gray-900 dark:text-white outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!newCatName.trim()) return;
                onAddCategory({
                  id: `cat-${Date.now()}`,
                  nombre: newCatName.trim(),
                  icono: newCatEmoji.trim() || '🏷️',
                  esPersonalizada: true
                });
                setNewCatName('');
                setNewCatEmoji('🏷️');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              + Agregar Categoría
            </button>
          </div>
        )}
      </div>

      {/* ─── 4. PARÁMETROS Y GESTOR DE MULTI-TASAS DE VENEZUELA ────────── */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-5 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sliders size={16} />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Panel de Tasas de Cambio & Gestor Personalizado</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Ajusta las tasas principales o crea tus propias tasas personalizadas (ej. Camión, Mayorista, Don Pedro).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingCustomRate(!isAddingCustomRate)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>{isAddingCustomRate ? 'Cerrar Formulario' : '+ Crear Tasa Personalizada'}</span>
          </button>
        </div>

        {/* Formulario Agregar Tasa Personalizada */}
        {isAddingCustomRate && (
          <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 dark:text-blue-200 uppercase">
              <Coins size={15} />
              <span>Nueva Tasa de Cambio Personalizada</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nombre de la Tasa:</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={4}
                    value={newRateEmoji}
                    onChange={e => setNewRateEmoji(e.target.value)}
                    placeholder="Emoji"
                    className="w-14 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2 text-center text-sm outline-none"
                  />
                  <input
                    type="text"
                    value={newRateName}
                    onChange={e => setNewRateName(e.target.value)}
                    placeholder="Ej. Tasa Camión San Cristóbal, Dólar Don Pedro..."
                    className="flex-1 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Valor Numérico (Bs/$ o COP/$):</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.10"
                  value={newRateValue}
                  onChange={e => setNewRateValue(parseLocaleNumber(e.target.value, 0))}
                  className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2 font-black text-sm text-center outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddCustomRate}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer min-h-[38px]"
                >
                  Guardar Tasa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Tasas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Tasa Oficial BCV */}
          <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase">
                🇻🇪 Tasa Oficial BCV (Bs/$)
              </label>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-extrabold px-1.5 py-0.5 rounded">
                Oficial
              </span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="0.10"
              min="0.10"
              value={tasas.tasaBCV === 0 ? '' : tasas.tasaBCV}
              onChange={e => {
                const val = parseLocaleNumber(e.target.value, 0);
                onUpdateTasas({ tasaBCV: val });
              }}
              onBlur={() => {
                if (!tasas.tasaBCV || tasas.tasaBCV <= 0) {
                  onUpdateTasas({ tasaBCV: 76.50 });
                }
              }}
              className="w-full bg-white dark:bg-[#0f172a] border border-blue-300 dark:border-blue-700 rounded-xl p-2.5 text-xl font-black text-blue-950 dark:text-blue-100 outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-gray-500 dark:text-slate-400">Cotización oficial del Banco Central de Venezuela.</span>
          </div>

          {/* Tasa Dólar Paralelo / Monitor */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">
                📈 Dólar Paralelo / Monitor (Bs/$)
              </label>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
                Mercado
              </span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="0.50"
              min="1"
              value={tasas.tasaParalelo === 0 ? '' : (tasas.tasaParalelo || 95.00)}
              onChange={e => {
                const val = parseLocaleNumber(e.target.value, 0);
                onUpdateTasas({ tasaParalelo: val });
              }}
              onBlur={() => {
                if (!tasas.tasaParalelo || tasas.tasaParalelo <= 0) {
                  onUpdateTasas({ tasaParalelo: 95.00 });
                }
              }}
              className="w-full bg-white dark:bg-[#0f172a] border border-emerald-300 dark:border-emerald-700 rounded-xl p-2.5 text-xl font-black text-emerald-950 dark:text-emerald-100 outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-gray-500 dark:text-slate-400">Tasa de mercado / efectivo para reposición de inventario.</span>
          </div>

          {/* Tasa Proveedor / Reposición */}
          <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase">
                🤝 Dólar Proveedor / Reposición (Bs/$)
              </label>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-extrabold px-1.5 py-0.5 rounded">
                Pactada
              </span>
            </div>
            <input
              type="number"
              inputMode="decimal"
              step="0.50"
              min="1"
              value={tasas.tasaProveedor === 0 ? '' : (tasas.tasaProveedor || 92.00)}
              onChange={e => {
                const val = parseLocaleNumber(e.target.value, 0);
                onUpdateTasas({ tasaProveedor: val });
              }}
              onBlur={() => {
                if (!tasas.tasaProveedor || tasas.tasaProveedor <= 0) {
                  onUpdateTasas({ tasaProveedor: 92.00 });
                }
              }}
              className="w-full bg-white dark:bg-[#0f172a] border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xl font-black text-amber-950 dark:text-amber-100 outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-gray-500 dark:text-slate-400">Tasa personalizada cobrada por mayoristas o distribuidores.</span>
          </div>

          {/* Tasa COP de Venta */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">
              🇨🇴 Tasa COP de Venta (COP/$)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="10"
              min="100"
              value={tasas.tasaCOP === 0 ? '' : (tasas.tasaCOP || 3850)}
              onChange={e => {
                const val = parseLocaleNumber(e.target.value, 0);
                onUpdateTasas({ tasaCOP: val });
              }}
              onBlur={() => {
                if (!tasas.tasaCOP || tasas.tasaCOP <= 0) {
                  onUpdateTasas({ tasaCOP: 3850 });
                }
              }}
              className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 text-xl font-black text-gray-900 dark:text-white outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-gray-400">Equivalencia para cobro en pesos colombianos.</span>
          </div>

          {/* Divisor Base CSV */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">
              🔢 Divisor Compra COP ➔ USDT (CSV)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="10"
              min="1"
              value={tasas.tasaCompraCOP_USDT === 0 ? '' : (tasas.tasaCompraCOP_USDT || 3200)}
              onChange={e => {
                const val = parseLocaleNumber(e.target.value, 0);
                onUpdateTasas({ tasaCompraCOP_USDT: val });
              }}
              onBlur={() => {
                if (!tasas.tasaCompraCOP_USDT || tasas.tasaCompraCOP_USDT <= 0) {
                  onUpdateTasas({ tasaCompraCOP_USDT: 3200 });
                }
              }}
              className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 text-xl font-black text-purple-900 dark:text-purple-200 outline-none focus:border-purple-500"
            />
            <span className="text-[11px] text-gray-400">Factor divisor de la feria (ej. 100.000 ÷ 3200 = 31.25 USDT).</span>
          </div>

          {/* Tasa USDT P2P */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <label className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase">
              ₮ Tasa Cripto USDT P2P (Bs/USDT)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.50"
              min="1"
              value={tasas.tasaUSDT === 0 ? '' : (tasas.tasaUSDT || 94.00)}
              onChange={e => {
                const val = parseLocaleNumber(e.target.value, 0);
                onUpdateTasas({ tasaUSDT: val });
              }}
              onBlur={() => {
                if (!tasas.tasaUSDT || tasas.tasaUSDT <= 0) {
                  onUpdateTasas({ tasaUSDT: 94.00 });
                }
              }}
              className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 text-xl font-black text-indigo-900 dark:text-indigo-200 outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-gray-400">Cotización de compra P2P en Binance/USDT.</span>
          </div>

        </div>

        {/* ─── LISTA DE TASAS PERSONALIZADAS CREADAS POR EL USUARIO ─── */}
        {customRatesList.length > 0 && (
          <div className="flex flex-col gap-2.5 pt-3 border-t border-gray-200 dark:border-slate-800">
            <span className="text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Tus Tasas Personalizadas Creadas ({customRatesList.length})</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customRatesList.map(cr => (
                <div
                  key={cr.id}
                  className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base shrink-0">{cr.icono || '💵'}</span>
                      <span className="font-black text-xs text-gray-900 dark:text-white truncate">
                        {cr.nombre}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomRate(cr.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                      title="Eliminar tasa personalizada"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.10"
                      value={cr.valor}
                      onChange={e => handleUpdateCustomRateValue(cr.id, parseLocaleNumber(e.target.value, 0))}
                      className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-1 text-center font-black text-sm text-blue-900 dark:text-blue-200 outline-none"
                    />
                    <span className="text-xs font-bold text-gray-500">Bs/$</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reglas de Redondeo Comercial en Bolívares */}
        <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 mt-1">
          <label className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase">
            Regla de Redondeo de Precios en Bolívares (BCV)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onUpdateTasas({ tipoRedondeoBCV: 'entero' })}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                tasas.tipoRedondeoBCV === 'entero'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              <span>⭐ Entero Superior</span>
              <span className="text-[11px] opacity-80">Ej. 32.40 Bs ➔ 33 Bs</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateTasas({ tipoRedondeoBCV: 'multiplo_5' })}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                tasas.tipoRedondeoBCV === 'multiplo_5'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              <span>Múltiplo de 5 Bs</span>
              <span className="text-[11px] opacity-80">Ej. 32.40 Bs ➔ 35 Bs</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateTasas({ tipoRedondeoBCV: 'exacto' })}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1 cursor-pointer ${
                tasas.tipoRedondeoBCV === 'exacto'
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              <span>Exacto con Céntimos</span>
              <span className="text-[11px] opacity-80">Ej. 32.40 Bs exacto</span>
            </button>
          </div>
        </div>

      </div>

      {/* ─── 5. ACCESIBILIDAD ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-gray-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h2 className="font-extrabold text-base">Accesibilidad y Tamaño de Letra</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase">Tamaño de Texto</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onFontSizeChange('normal')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  fontSize === 'normal' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => onFontSizeChange('grande')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  fontSize === 'grande' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                }`}
              >
                Grande (A+)
              </button>
              <button
                onClick={() => onFontSizeChange('extra')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  fontSize === 'extra' ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
                }`}
              >
                Gigante (A++)
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase">Modo Alto Contraste</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">Maximiza la legibilidad bajo luz solar</div>
            </div>
            <button
              onClick={onToggleHighContrast}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                highContrast ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-[#0f172a] border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300'
              }`}
            >
              {highContrast ? 'Activado' : 'Desactivado'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
