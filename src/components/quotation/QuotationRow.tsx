import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CotizadorQuoteItem } from '../../types/cotizador';
import { WEIGHT_UNIT_CONVERSIONS } from '../../utils/cotizadorData';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface QuotationRowProps {
  item: CotizadorQuoteItem;
  index: number;
  onUpdateItem: (index: number, updates: Partial<CotizadorQuoteItem>) => void;
  onIncrementItem: (index: number, stepDelta: number) => void;
  onRemoveItem: (index: number) => void;
}

export const QuotationRow: React.FC<QuotationRowProps> = ({
  item,
  index,
  onUpdateItem,
  onIncrementItem,
  onRemoveItem
}) => {
  const unitStep = WEIGHT_UNIT_CONVERSIONS[item.unidad]?.step || 1;
  const hasTare = (item.taraKg || 0) > 0;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
      {/* Icono y Nombre */}
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl shrink-0">{item.icono}</span>
          <div className="min-w-0">
            <span className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm block truncate" title={item.nombre}>
              {item.nombre}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium block">
              {item.categoria}
            </span>
          </div>
        </div>
      </td>

      {/* Controles de Cantidad / Peso Ergonómicos */}
      <td className="p-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onIncrementItem(index, -unitStep)}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-black text-sm flex items-center justify-center border border-gray-200 dark:border-slate-700 active:scale-95 transition-all shrink-0 cursor-pointer"
            title={`Restar ${unitStep} ${item.unidad}`}
          >
            −
          </button>
          <input
            type="number"
            inputMode="decimal"
            step={unitStep}
            min="0.001"
            value={item.cantidad}
            onChange={e => onUpdateItem(index, { cantidad: Math.max(0.001, parseFloat(e.target.value) || 1) })}
            className="w-14 sm:w-16 text-center font-extrabold text-gray-900 dark:text-white bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700 rounded-lg py-1 text-xs sm:text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={() => onIncrementItem(index, unitStep)}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-black text-sm flex items-center justify-center border border-gray-200 dark:border-slate-700 active:scale-95 transition-all shrink-0 cursor-pointer"
            title={`Sumar ${unitStep} ${item.unidad}`}
          >
            <Plus size={14} />
          </button>
        </div>
      </td>

      {/* Selector de Unidad */}
      <td className="p-3 text-center">
        <select
          value={item.unidad}
          onChange={e => onUpdateItem(index, { unidad: e.target.value as CotizadorQuoteItem['unidad'] })}
          className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer focus:border-blue-500"
        >
          <option value="Kg">Kg</option>
          <option value="g">g</option>
          <option value="lb">lb</option>
          <option value="Unidad">Und</option>
          <option value="Manojo">Mnj</option>
          <option value="Saco">Sco</option>
          <option value="Cesta">Ces</option>
          <option value="Paquete">Paq</option>
        </select>
      </td>

      {/* Tara Input */}
      <td className="p-3 text-center">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          placeholder="0.0"
          value={item.taraKg || ''}
          onChange={e => onUpdateItem(index, { taraKg: Math.max(0, parseFloat(e.target.value) || 0) })}
          className={`w-14 text-center font-extrabold px-1.5 py-1 rounded-lg border outline-none text-xs sm:text-sm min-h-[32px] transition-colors ${
            hasTare
              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
              : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 focus:border-blue-500'
          }`}
          title="Tara a descontar"
        />
      </td>

      {/* Peso Neto */}
      <td className="p-3 text-center">
        <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-xs whitespace-nowrap ${
          hasTare
            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'text-gray-700 dark:text-slate-300'
        }`}>
          {CotizadorCalculator.formatWeight(item.netKg || 0, true)}
        </span>
      </td>

      {/* Subtotal BCV */}
      <td className="p-3 text-right font-black text-blue-600 dark:text-blue-400 text-xs sm:text-sm whitespace-nowrap">
        {CotizadorCalculator.formatBCV(item.subtotalVES || 0)}
      </td>

      {/* Subtotal USD */}
      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm whitespace-nowrap">
        {CotizadorCalculator.formatUSD(item.subtotalUSD || 0)}
      </td>

      {/* Eliminar Fila */}
      <td className="p-3 text-center">
        <button
          onClick={() => onRemoveItem(index)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          title={`Eliminar ${item.nombre}`}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
