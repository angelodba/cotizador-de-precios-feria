import React from 'react';
import { Calculator, RotateCcw, Check, Zap, ArrowRight } from 'lucide-react';
import type { CotizadorRates, TipoFormulaCOP, TipoRedondeoBCV, TipoRedondeoCOP } from '../../types/cotizador';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface FormulaSettingsPanelProps {
  rates: CotizadorRates;
  testFormulaCOP: number;
  testFormulaPreview: {
    precioBCV: number;
    precioCOP: number;
    precioRefDolarBCV: number;
    formulaActivaTexto: string;
  };
  onRateChange: (key: keyof CotizadorRates, value: unknown) => void;
  onFormulaTypeChange: (tipo: TipoFormulaCOP) => void;
  onResetFormulaToDefault: () => void;
  onTestFormulaCOPChange: (val: number) => void;
}

export const FormulaSettingsPanel: React.FC<FormulaSettingsPanelProps> = ({
  rates,
  testFormulaCOP,
  testFormulaPreview,
  onRateChange,
  onFormulaTypeChange,
  onResetFormulaToDefault,
  onTestFormulaCOPChange
}) => {
  return (
    <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 animate-fade-in shadow-sm text-gray-900 dark:text-white">
      
      {/* Cabecera del Panel de Fórmulas */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3 flex-wrap gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
              Configuración de Fórmula Dinámica (Compras en COP)
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              Estrategia de conversión matemática para fijar precios en Bolívares y Dólares
            </p>
          </div>
        </div>

        {/* Botón de Restaurar a la Fórmula Oficial */}
        <button
          type="button"
          onClick={onResetFormulaToDefault}
          className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition-all flex items-center gap-1.5 min-h-[38px] shadow-sm shrink-0 cursor-pointer"
          title="Restaurar valores por defecto (3150 / 880 / 765)"
        >
          <RotateCcw size={14} />
          <span>Restaurar Fórmula Oficial</span>
        </button>
      </div>

      {/* 1. Selector de Estrategia de Cálculo */}
      <div>
        <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
          1. Selecciona la Estrategia de Cálculo:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          
          {/* Preset 1: Oficial Feria */}
          <button
            type="button"
            onClick={() => onFormulaTypeChange('feria_3_factores')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 min-h-[70px] cursor-pointer ${
              (rates.tipoFormulaCOP || 'feria_3_factores') === 'feria_3_factores'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1">
                <span>🌟</span>
                <span>Oficial Feria (Default)</span>
              </span>
              {(rates.tipoFormulaCOP || 'feria_3_factores') === 'feria_3_factores' && (
                <Check size={14} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
              [Costo] ÷ TasaCompra × Margen ÷ TasaDivisa
            </p>
          </button>

          {/* Preset 2: Margen Porcentual % */}
          <button
            type="button"
            onClick={() => onFormulaTypeChange('costo_margen_porcentaje')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 min-h-[70px] cursor-pointer ${
              rates.tipoFormulaCOP === 'costo_margen_porcentaje'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1">
                <span>📈</span>
                <span>Margen Porcentual %</span>
              </span>
              {rates.tipoFormulaCOP === 'costo_margen_porcentaje' && (
                <Check size={14} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
              ([Costo] ÷ Tasa COP) + Margen %
            </p>
          </button>

          {/* Preset 3: Multiplicador Directo */}
          <button
            type="button"
            onClick={() => onFormulaTypeChange('factor_directo_bcv')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 min-h-[70px] cursor-pointer ${
              rates.tipoFormulaCOP === 'factor_directo_bcv'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1">
                <span>⚡</span>
                <span>Multiplicador Directo</span>
              </span>
              {rates.tipoFormulaCOP === 'factor_directo_bcv' && (
                <Check size={14} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
              [Costo COP] × Factor Directo = Bs.
            </p>
          </button>

          {/* Preset 4: Constructor Personalizado */}
          <button
            type="button"
            onClick={() => onFormulaTypeChange('personalizada')}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 min-h-[70px] cursor-pointer ${
              rates.tipoFormulaCOP === 'personalizada'
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-900 dark:text-blue-200 shadow-sm'
                : 'bg-white dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="flex items-center gap-1">
                <span>🛠️</span>
                <span>Personalizada</span>
              </span>
              {rates.tipoFormulaCOP === 'personalizada' && (
                <Check size={14} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-mono">
              Constructor libre de 3 pasos
            </p>
          </button>
        </div>
      </div>

      {/* 2. Parámetros Específicos según la Estrategia */}
      <div className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-3">
        <div className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
          2. Ajusta los Valores de la Fórmula Seleccionada:
        </div>

        {/* CASO A: Oficial Feria (3 Factores) */}
        {(!rates.tipoFormulaCOP || rates.tipoFormulaCOP === 'feria_3_factores') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-200">1. Tasa Compra COP/USDT</label>
              <div className="text-[11px] text-gray-500 dark:text-slate-400">Divide el costo en COP a USDT</div>
              <input
                type="number"
                inputMode="decimal"
                step="10"
                value={rates.tasaCompraCOP_USDT || 3150}
                onChange={e => onRateChange('tasaCompraCOP_USDT', parseFloat(e.target.value) || 3150)}
                className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm sm:text-base font-black text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-200">2. Factor Margen (COP)</label>
              <div className="text-[11px] text-gray-500 dark:text-slate-400">Multiplica USDT a COP de venta</div>
              <input
                type="number"
                inputMode="decimal"
                step="10"
                value={rates.factorMargen || 880}
                onChange={e => onRateChange('factorMargen', parseFloat(e.target.value) || 880)}
                className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm sm:text-base font-black text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-200">3. Tasa Divisa (Bs)</label>
              <div className="text-[11px] text-gray-500 dark:text-slate-400">Divide COP venta a Bolívares</div>
              <input
                type="number"
                inputMode="decimal"
                step="5"
                value={rates.tasaDivisaBCV || 765}
                onChange={e => onRateChange('tasaDivisaBCV', parseFloat(e.target.value) || 765)}
                className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm sm:text-base font-black text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>
          </div>
        )}

        {/* CASO B: Margen Porcentual % */}
        {rates.tipoFormulaCOP === 'costo_margen_porcentaje' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Margen de Ganancia (%)</label>
              <div className="text-[11px] text-gray-500 dark:text-slate-400">Porcentaje añadido al costo (ej. 25 para 25%)</div>
              <input
                type="number"
                inputMode="decimal"
                step="5"
                value={rates.margenPorcentajeCOP ?? 25}
                onChange={e => onRateChange('margenPorcentajeCOP', parseFloat(e.target.value) || 0)}
                className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Tasa de Conversión COP ($)</label>
              <div className="text-[11px] text-gray-500 dark:text-slate-400">Tasa actual de cambio de COP a USD</div>
              <input
                type="number"
                inputMode="decimal"
                step="10"
                value={rates.cop}
                onChange={e => onRateChange('cop', parseFloat(e.target.value) || 3850)}
                className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 outline-none focus:border-blue-500 min-h-[40px]"
              />
            </div>
          </div>
        )}

        {/* CASO C: Multiplicador Directo */}
        {rates.tipoFormulaCOP === 'factor_directo_bcv' && (
          <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Factor Multiplicador Directo a Bolívares</label>
            <div className="text-[11px] text-gray-500 dark:text-slate-400">Ejemplo: 0.000365 (90.000 COP × 0.000365 = 32.85 Bs)</div>
            <input
              type="number"
              inputMode="decimal"
              step="0.00001"
              value={rates.factorDirectoBCV ?? 0.000365}
              onChange={e => onRateChange('factorDirectoBCV', parseFloat(e.target.value) || 0.000365)}
              className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm sm:text-base font-black text-purple-600 dark:text-purple-400 outline-none focus:border-blue-500 min-h-[40px]"
            />
          </div>
        )}

        {/* CASO D: Constructor Personalizado */}
        {rates.tipoFormulaCOP === 'personalizada' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Paso 1 */}
            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200">Paso 1: Costo COP</span>
              <div className="flex gap-1.5">
                <select
                  value={rates.formulaPersonalizada?.op1 || 'div'}
                  onChange={e => onRateChange('formulaPersonalizada', {
                    ...rates.formulaPersonalizada,
                    op1: e.target.value as 'div' | 'mul'
                  })}
                  className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg px-2 text-xs font-bold text-gray-900 dark:text-white outline-none min-h-[40px]"
                >
                  <option value="div">÷ Divide</option>
                  <option value="mul">× Multiplica</option>
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  value={rates.formulaPersonalizada?.val1 ?? 3150}
                  onChange={e => onRateChange('formulaPersonalizada', {
                    ...rates.formulaPersonalizada,
                    val1: parseFloat(e.target.value) || 1
                  })}
                  className="w-full bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm font-black text-gray-900 dark:text-white outline-none min-h-[40px]"
                />
              </div>
            </div>

            {/* Paso 2 */}
            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200">Paso 2</span>
              <div className="flex gap-1.5">
                <select
                  value={rates.formulaPersonalizada?.op2 || 'mul'}
                  onChange={e => onRateChange('formulaPersonalizada', {
                    ...rates.formulaPersonalizada,
                    op2: e.target.value as 'mul' | 'div' | 'add'
                  })}
                  className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg px-2 text-xs font-bold text-gray-900 dark:text-white outline-none min-h-[40px]"
                >
                  <option value="mul">× Multiplica</option>
                  <option value="div">÷ Divide</option>
                  <option value="add">+ Suma</option>
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  value={rates.formulaPersonalizada?.val2 ?? 880}
                  onChange={e => onRateChange('formulaPersonalizada', {
                    ...rates.formulaPersonalizada,
                    val2: parseFloat(e.target.value) || 1
                  })}
                  className="w-full bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm font-black text-gray-900 dark:text-white outline-none min-h-[40px]"
                />
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200">Paso 3 (Resultado Bs.)</span>
              <div className="flex gap-1.5">
                <select
                  value={rates.formulaPersonalizada?.op3 || 'div'}
                  onChange={e => onRateChange('formulaPersonalizada', {
                    ...rates.formulaPersonalizada,
                    op3: e.target.value as 'div' | 'mul'
                  })}
                  className="bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg px-2 text-xs font-bold text-gray-900 dark:text-white outline-none min-h-[40px]"
                >
                  <option value="div">÷ Divide</option>
                  <option value="mul">× Multiplica</option>
                </select>
                <input
                  type="number"
                  inputMode="decimal"
                  value={rates.formulaPersonalizada?.val3 ?? 765}
                  onChange={e => onRateChange('formulaPersonalizada', {
                    ...rates.formulaPersonalizada,
                    val3: parseFloat(e.target.value) || 1
                  })}
                  className="w-full bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-sm font-black text-gray-900 dark:text-white outline-none min-h-[40px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Redondeos Comerciales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-slate-800">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Redondeo Bolívares (BCV)</label>
            <select
              value={rates.tipoRedondeoBCV || 'entero'}
              onChange={e => onRateChange('tipoRedondeoBCV', e.target.value as TipoRedondeoBCV)}
              className="bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[40px] cursor-pointer"
            >
              <option value="entero">Entero (ej. 33 Bs)</option>
              <option value="multiplo_5">Múltiplo de 5 Bs (ej. 35 Bs)</option>
              <option value="multiplo_10">Múltiplo de 10 Bs (ej. 40 Bs)</option>
              <option value="exacto">Exacto con céntimos (.00)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-200">Redondeo Pesos (COP)</label>
            <select
              value={rates.tipoRedondeoCOP || 'centena'}
              onChange={e => onRateChange('tipoRedondeoCOP', e.target.value as TipoRedondeoCOP)}
              className="bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-amber-500 min-h-[40px] cursor-pointer"
            >
              <option value="centena">Centena (ej. 25.100)</option>
              <option value="quinientos">Quinientos (ej. 25.500)</option>
              <option value="mil">Miles (ej. 25.000)</option>
              <option value="exacto">Exacto (0 decimales)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Simulador de Prueba de Fórmula en Vivo */}
      <div className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Zap size={15} />
            <span>Prueba en Vivo:</span>
          </span>
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700">
            <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Costo COP:</span>
            <input
              type="number"
              inputMode="decimal"
              step="1000"
              value={testFormulaCOP}
              onChange={e => onTestFormulaCOPChange(parseFloat(e.target.value) || 0)}
              className="w-24 bg-transparent font-black text-gray-900 dark:text-white text-sm outline-none"
            />
          </div>
          <ArrowRight size={15} className="text-gray-400 hidden sm:block shrink-0" />
        </div>

        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg text-center shadow-sm min-w-0">
            <span className="text-[10px] text-blue-700 dark:text-blue-300 block font-bold">PRECIO BCV</span>
            <span className="text-sm font-black text-blue-900 dark:text-white">{CotizadorCalculator.formatBCV(testFormulaPreview.precioBCV)}</span>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg text-center shadow-sm min-w-0">
            <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-bold">PRECIO COP</span>
            <span className="text-sm font-black text-amber-900 dark:text-white">{CotizadorCalculator.formatCOP(testFormulaPreview.precioCOP)}</span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-lg text-center shadow-sm min-w-0">
            <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-bold">REF. DÓLAR BCV</span>
            <span className="text-sm font-black text-purple-900 dark:text-purple-100">${testFormulaPreview.precioRefDolarBCV.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 4. Banner de Fórmula Activa en Notación Matemática */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <span className="text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5 shrink-0">
          <span>📐</span>
          <span>Fórmula Activa para Compras en COP:</span>
        </span>
        <span className="text-gray-900 dark:text-white font-mono text-xs sm:text-sm bg-white dark:bg-[#0f172a] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 break-words max-w-full">
          {testFormulaPreview.formulaActivaTexto}
        </span>
      </div>
    </div>
  );
};
