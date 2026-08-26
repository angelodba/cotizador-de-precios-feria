import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Printer,
  TrendingUp,
  Package,
  Scale,
  RotateCcw,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  AlertTriangle,
  Zap,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';
import type { ItemCosteo, TasasCosteo, CostingTab, CategoriaDef } from '../../types/costing';
import { CostingCalculator } from '../../utils/costingCalculator';
import { parseLocaleNumber, hapticFeedback } from '../../utils/mobileUtils';

interface HojaCosteoViewProps {
  items: ItemCosteo[];
  tasas: TasasCosteo;
  customCategories?: CategoriaDef[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (item: ItemCosteo) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItemMargin: (id: string, newMargin: number) => void;
  onBatchUpdateMargins: (newMargin: number) => void;
  onResetDefaultItems: () => void;
  onNavigateTab: (tab: CostingTab) => void;
  onShowToast: (msg: string) => void;
}

type SortField = 'nombre' | 'inversion' | 'costoKilo' | 'margen' | 'precioDetal' | 'ganancia';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'todos' | 'rentables' | 'alerta';

export const HojaCosteoView: React.FC<HojaCosteoViewProps> = ({
  items,
  tasas,
  customCategories = [],
  onOpenCreateModal,
  onOpenEditModal,
  onDeleteItem,
  onUpdateItemMargin,
  onBatchUpdateMargins,
  onResetDefaultItems,
  onNavigateTab,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [batchMarginInput, setBatchMarginInput] = useState<number>(30);
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  // Calcular todos los ítems con el motor de cálculo
  const calculatedItems = useMemo(() => {
    return items.map(item => CostingCalculator.calculateItem(item, tasas));
  }, [items, tasas]);

  // Categorías dinámicas (incluyendo predeterminadas y personalizadas)
  const categories: string[] = useMemo(() => {
    const list = ['Todas'];
    const baseCats = ['Tubérculos', 'Hortalizas', 'Frutas', 'Aliños', 'Víveres', 'Servicios y Fletes', 'Empaques e Insumos', 'Otros'];
    baseCats.forEach(c => {
      if (!list.includes(c)) list.push(c);
    });
    customCategories.forEach(cc => {
      if (!list.includes(cc.nombre)) list.push(cc.nombre);
    });
    items.forEach(it => {
      if (it.categoria && !list.includes(it.categoria)) {
        list.push(it.categoria);
      }
    });
    return list;
  }, [customCategories, items]);

  // Descriptor de la fórmula activa
  const formulaDescriptor = useMemo(() => {
    return CostingCalculator.getFormulaDescriptor(tasas);
  }, [tasas]);

  // Conteo de rentabilidad y alertas
  const rentablesCount = useMemo(() => {
    return calculatedItems.filter(it => it.gananciaTotalEmpaqueUSD > 0).length;
  }, [calculatedItems]);

  const alertaCount = useMemo(() => {
    return calculatedItems.filter(it => it.gananciaTotalEmpaqueUSD <= 0).length;
  }, [calculatedItems]);

  // Normalizar texto para búsqueda sin acentos ni mayúsculas
  const normalizeText = (text: string) =>
    (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Filtrar ítems
  const filteredItems = useMemo(() => {
    const q = normalizeText(searchQuery);
    return calculatedItems.filter(item => {
      const matchCategory =
        selectedCategory === 'Todas' ||
        (item.categoria && item.categoria.toLowerCase() === selectedCategory.toLowerCase());

      const matchSearch =
        !q ||
        normalizeText(item.nombre).includes(q) ||
        normalizeText(item.categoria || '').includes(q) ||
        normalizeText(item.tipoEmpaque || '').includes(q) ||
        normalizeText(item.proveedor || '').includes(q);
      
      let matchStatus = true;
      if (statusFilter === 'rentables') {
        matchStatus = item.gananciaTotalEmpaqueUSD > 0;
      } else if (statusFilter === 'alerta') {
        matchStatus = item.gananciaTotalEmpaqueUSD <= 0;
      }

      return matchCategory && matchSearch && matchStatus;
    });
  }, [calculatedItems, selectedCategory, searchQuery, statusFilter]);

  // Conteo de rubros por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: calculatedItems.length };
    calculatedItems.forEach(it => {
      const cat = it.categoria || 'Otros';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [calculatedItems]);

  // Ordenar ítems
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
        case 'inversion':
          comparison = a.costoTotalEmpaqueUSD - b.costoTotalEmpaqueUSD;
          break;
        case 'costoKilo':
          comparison = a.costoKiloUSD - b.costoKiloUSD;
          break;
        case 'margen':
          comparison = (a.margenPorcentaje || 0) - (b.margenPorcentaje || 0);
          break;
        case 'precioDetal':
          comparison = a.precioVentaDetalKiloVES - b.precioVentaDetalKiloVES;
          break;
        case 'ganancia':
          comparison = a.gananciaTotalEmpaqueUSD - b.gananciaTotalEmpaqueUSD;
          break;
        default:
          comparison = 0;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'nombre' ? 'asc' : 'desc');
    }
  };

  // Métricas Totales
  const totalInversionUSD = calculatedItems.reduce((acc, it) => acc + it.costoTotalEmpaqueUSD, 0);
  const totalInversionVES = totalInversionUSD * tasas.tasaBCV;
  const totalKilosBrutos = calculatedItems.reduce((acc, it) => acc + it.pesoEmpaqueKg, 0);
  const totalGananciaProyectadaUSD = calculatedItems.reduce((acc, it) => acc + it.gananciaTotalEmpaqueUSD, 0);
  const totalGananciaProyectadaVES = totalGananciaProyectadaUSD * tasas.tasaBCV;
  const margenPromedio = totalInversionUSD > 0 ? (totalGananciaProyectadaUSD / totalInversionUSD) * 100 : 0;

  const handleExportCSV = () => {
    let csv = 'Rubro,Categoria,Empaque,Peso Kg,Costo Compra Moneda,Monto Compra,Costo Total USD,Costo x Kilo USD,Costo x Kilo Bs,Margen Detal %,Precio Detal Kilo Bs,Precio Detal Kilo USD,Precio Mayor Kilo Bs,Precio Mayor Saco USD,Ganancia Saco USD,Ganancia Saco Bs\n';
    calculatedItems.forEach(it => {
      csv += `"${it.nombre}","${it.categoria}","${it.tipoEmpaque}",${it.pesoEmpaqueKg},"${it.monedaCosto}",${it.costoEmpaque},${it.costoTotalEmpaqueUSD},${it.costoKiloUSD},${it.costoKiloVES},${it.margenPorcentaje},${it.precioVentaDetalKiloVES},${it.precioVentaDetalKiloUSD},${it.precioVentaMayorKiloVES},${it.precioVentaMayorEmpaqueUSD},${it.gananciaTotalEmpaqueUSD},${it.gananciaTotalEmpaqueVES}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hoja_costeo_feria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('📊 Hoja de costeo descargada en formato CSV.');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-28 sm:pb-8 overflow-y-auto max-w-7xl mx-auto w-full gap-5 sm:gap-6 touch-scroll">
      
      {/* ─── HEADER DE LA HOJA DE COSTEO ──────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Hoja de Costeo Automatizada</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Calcula el costo real por kilo de cada saco/bulto y fija los precios oficiales al detal y mayor.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 transition-all min-h-[42px] cursor-pointer active:scale-95"
            title="Exportar a archivo CSV / Excel"
            aria-label="Exportar CSV"
          >
            <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">Excel / CSV</span>
            <span className="xs:hidden">Excel</span>
          </button>

          <button
            onClick={() => onNavigateTab('pizarra_precios')}
            className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 transition-all min-h-[42px] cursor-pointer active:scale-95"
            aria-label="Ir a Pizarra de Precios"
          >
            <Printer size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Pizarra</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 min-h-[42px] cursor-pointer"
            aria-label="Ingresar nuevo saco o bulto"
          >
            <Plus size={18} />
            <span>+ Ingresar Saco</span>
          </button>
        </div>
      </header>

      {/* ─── BANNER DINÁMICO DE FÓRMULA ACTIVA Y TASAS ─────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50 dark:from-[#0f172a] dark:via-[#131b2e] dark:to-[#1e1b4b]/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                Estrategia Activa
              </span>
              <span className="font-extrabold text-xs sm:text-base text-gray-900 dark:text-white">
                {formulaDescriptor.titulo}
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
              <code className="font-mono text-[11px] sm:text-xs text-blue-950 dark:text-blue-200 bg-white/80 dark:bg-[#080d1a] px-2 py-0.5 rounded border border-blue-200 dark:border-slate-700">
                {formulaDescriptor.notacion}
              </code>
              <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400">
                • BCV: <strong className="text-gray-900 dark:text-white">{tasas.tasaBCV.toFixed(2)} Bs</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('configuracion')}
          className="px-3.5 py-2 bg-white dark:bg-[#1e293b] hover:bg-gray-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0 self-stretch sm:self-auto cursor-pointer transition-colors active:scale-95 min-h-[38px]"
        >
          <Sliders size={14} />
          <span>Ajustar Tasas</span>
        </button>
      </div>

      {/* ─── TARJETAS RESUMEN DE INVERSIÓN Y RENTABILIDAD ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* 1. Inversión Total */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Inversión Total</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package size={15} />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {CostingCalculator.formatUSD(totalInversionUSD)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 truncate">
              {CostingCalculator.formatVES(totalInversionVES)}
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
            {items.length} {items.length === 1 ? 'bulto' : 'bultos'}
          </div>
        </div>

        {/* 2. Kilos Comprados */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Kilaje</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Scale size={15} />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-lg sm:text-2xl font-black text-purple-900 dark:text-white tracking-tight">
              {totalKilosBrutos.toFixed(1)} Kg
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              100% Aprovechable
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
            Sin deducción por merma
          </div>
        </div>

        {/* 3. Ganancia Proyectada */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ganancia Est.</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{CostingCalculator.formatUSD(totalGananciaProyectadaUSD)}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 truncate">
              +{CostingCalculator.formatVES(totalGananciaProyectadaVES)}
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
            Al vender el lote
          </div>
        </div>

        {/* 4. Rentabilidad Promedio */}
        <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Margen Prom.</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign size={15} />
            </div>
          </div>
          <div className="my-1.5 sm:my-2">
            <div className="text-lg sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {margenPromedio.toFixed(1)}%
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-slate-400 mt-0.5">
              BCV: {tasas.tasaBCV.toFixed(2)} Bs
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
            Retorno inversión
          </div>
        </div>

      </div>

      {/* ─── BARRA DE BÚSQUEDA, FILTROS, CATEGORÍAS Y AJUSTE RÁPIDO ────── */}
      <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-200 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar papa, tomate, cebolla, flete..."
              className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-500 min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer active:scale-90"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Ajuste Rápido de Margen en Lote */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl flex-1 sm:flex-initial">
              <span className="text-[11px] sm:text-xs font-bold text-gray-700 dark:text-slate-300 whitespace-nowrap">Margen:</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                value={batchMarginInput}
                onChange={e => setBatchMarginInput(parseLocaleNumber(e.target.value, 0))}
                className="w-12 bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-lg p-1 text-center font-black text-xs sm:text-sm text-gray-900 dark:text-white"
              />
              <span className="text-xs font-bold text-gray-500">%</span>
              <button
                onClick={() => {
                  hapticFeedback('medium');
                  onBatchUpdateMargins(batchMarginInput);
                  onShowToast(`🎯 Margen del ${batchMarginInput}% aplicado a todos los rubros.`);
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Aplicar
              </button>
            </div>

            {/* Restaurar Rubros */}
            <button
              onClick={() => {
                if (window.confirm('¿Restaurar la lista de rubros predeterminados?')) {
                  onResetDefaultItems();
                  onShowToast('🔄 Lista de rubros restaurada.');
                }
              }}
              className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer active:scale-95"
              title="Restaurar rubros oficiales"
              aria-label="Restaurar rubros oficiales"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Filtros por Estado de Rentabilidad */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800/80 pt-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-slate-400">Ver:</span>
            <div className="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-xl border border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'todos'
                    ? 'bg-white dark:bg-[#0f172a] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                Todos ({calculatedItems.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('rentables')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'rentables'
                    ? 'bg-white dark:bg-[#0f172a] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Rentables ({rentablesCount})</span>
              </button>
              {alertaCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('alerta')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    statusFilter === 'alerta'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'text-red-500'
                  }`}
                >
                  <AlertTriangle size={12} />
                  <span>Alerta ({alertaCount})</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-slate-400">
            {sortedItems.length} de {items.length} rubros
          </div>
        </div>

        {/* Categorías con Conteo Dinámico & Scroll Táctil */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-scroll">
          {categories.map(cat => {
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 min-h-[36px] ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedCategory === cat
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── VISTA RESPONSIVA MÓVIL (TARJETAS INTELIGENTES ERGONÓMICAS) ──── */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {sortedItems.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-6 text-center text-gray-400 flex flex-col items-center gap-3">
            <span className="text-sm font-semibold">No se encontraron rubros con los filtros seleccionados.</span>
            {searchQuery || selectedCategory !== 'Todas' || statusFilter !== 'todos' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todas');
                  setStatusFilter('todos');
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs min-h-[42px] active:scale-95 cursor-pointer"
              >
                Limpiar Filtros y Mostrar Todos
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onResetDefaultItems();
                  onShowToast('🔄 Catálogo de 22 rubros restaurado.');
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 min-h-[42px] active:scale-95 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Cargar Catálogo Oficial (22 Rubros)</span>
              </button>
            )}
          </div>
        ) : (
          sortedItems.map(item => {
            const isLoss = item.gananciaTotalEmpaqueUSD <= 0;
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-[#0f172a] border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all ${
                  isLoss
                    ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                {/* Cabecera Tarjeta */}
                <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl sm:text-3xl shrink-0">{item.icono}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {item.nombre}
                        </h3>
                        {item.esServicio && (
                          <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-1.5 py-0.2 rounded shrink-0">
                            ⚡ Servicio
                          </span>
                        )}
                        {item.codigoSku && (
                          <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 px-1.5 py-0.2 rounded shrink-0">
                            {item.codigoSku}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          {item.categoria} • {item.tipoEmpaque} ({item.pesoEmpaqueKg} {item.esServicio ? 'unid' : 'Kg'})
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(item)}
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md cursor-pointer transition-all active:scale-95 ${
                            item.tipoFormulaItem && item.tipoFormulaItem !== 'heredar_global'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                          }`}
                          title={`Editar fórmula: ${CostingCalculator.getItemFormulaDescriptor(item, tasas).notacion}`}
                        >
                          {item.tipoFormulaItem && item.tipoFormulaItem !== 'heredar_global' ? '🛠️ Propia' : '🌐 Global'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Táctiles Rápidas */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 cursor-pointer"
                      title="Editar costeo"
                      aria-label={`Editar ${item.nombre}`}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar ${item.nombre}?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 cursor-pointer"
                      title="Eliminar rubro"
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                {/* Grid de Valores y Costos */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-[#131b2e] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Costo Bulto</span>
                    <span className="font-black text-gray-900 dark:text-white">
                      {item.monedaCosto === 'COP'
                        ? CostingCalculator.formatCOP(item.costoEmpaque)
                        : item.monedaCosto === 'USD'
                          ? CostingCalculator.formatUSD(item.costoEmpaque)
                          : CostingCalculator.formatVES(item.costoEmpaque)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Total: {CostingCalculator.formatUSD(item.costoTotalEmpaqueUSD)}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#131b2e] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Costo x Kilo</span>
                    <span className="font-black text-gray-900 dark:text-white">
                      {CostingCalculator.formatUSD(item.costoKiloUSD)} / Kg
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {CostingCalculator.formatVES(item.costoKiloVES)}
                    </span>
                  </div>

                  {/* PRECIO VENTA DETAL (DESTACADO OFICIAL PARA MOSTRADOR) */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/80 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col gap-0.5 col-span-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                        Precio Venta Detal
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">Margen:</span>
                        <div className="inline-flex items-center bg-white dark:bg-[#0f172a] px-1.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max="100"
                            value={item.margenPorcentaje}
                            onChange={e => onUpdateItemMargin(item.id, parseLocaleNumber(e.target.value, 0))}
                            className="w-8 bg-transparent text-center font-black text-xs text-emerald-700 dark:text-emerald-300 outline-none"
                          />
                          <span className="text-[10px] font-bold text-gray-400">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200">
                        {CostingCalculator.formatVES(item.precioVentaDetalKiloVES)}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {CostingCalculator.formatUSD(item.precioVentaDetalKiloUSD)} / Kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie de Ganancia */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                    {item.tipoEmpaque} ({item.pesoEmpaqueKg} {item.esServicio ? 'unid' : 'Kg'})
                  </span>
                  <span className={`font-black ${isLoss ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    Ganancia: +{CostingCalculator.formatUSD(item.gananciaTotalEmpaqueUSD)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── TABLA INTELIGENTE DE COSTEO (DESKTOP) ───────────────────── */}
      <div className="hidden md:block bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto touch-scroll">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[950px]">
            <thead className="bg-gray-50 dark:bg-[#131b2e] text-gray-500 dark:text-slate-400 text-[11px] font-extrabold uppercase tracking-wider sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 select-none">
              <tr>
                {/* Rubro */}
                <th
                  onClick={() => handleSort('nombre')}
                  className="p-3.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rubro</span>
                    {sortField === 'nombre' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-500" /> : <ArrowDown size={13} className="text-blue-500" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Empaque */}
                <th className="p-3.5">Presentación / Peso</th>

                {/* Costo Compra */}
                <th
                  onClick={() => handleSort('inversion')}
                  className="p-3.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Costo Compra</span>
                    {sortField === 'inversion' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-500" /> : <ArrowDown size={13} className="text-blue-500" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Costo x Kilo */}
                <th
                  onClick={() => handleSort('costoKilo')}
                  className="p-3.5 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Costo x Kilo</span>
                    {sortField === 'costoKilo' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-500" /> : <ArrowDown size={13} className="text-blue-500" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Margen */}
                <th
                  onClick={() => handleSort('margen')}
                  className="p-3.5 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Margen</span>
                    {sortField === 'margen' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-500" /> : <ArrowDown size={13} className="text-blue-500" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Precio Detal x Kilo */}
                <th
                  onClick={() => handleSort('precioDetal')}
                  className="p-3.5 text-right bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Precio Detal x Kilo</span>
                    {sortField === 'precioDetal' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} className="text-emerald-600" /> : <ArrowDown size={13} className="text-emerald-600" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Precio Mayor */}
                <th className="p-3.5 text-right">Precio Mayor</th>

                {/* Ganancia x Saco */}
                <th
                  onClick={() => handleSort('ganancia')}
                  className="p-3.5 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Ganancia x Saco</span>
                    {sortField === 'ganancia' ? (
                      sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-500" /> : <ArrowDown size={13} className="text-blue-500" />
                    ) : (
                      <ArrowUpDown size={13} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Acciones */}
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span className="text-sm font-semibold">No se encontraron rubros con los filtros seleccionados.</span>
                      {searchQuery || selectedCategory !== 'Todas' || statusFilter !== 'todos' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('Todas');
                            setStatusFilter('todos');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          Limpiar Filtros y Mostrar Todos
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onResetDefaultItems();
                            onShowToast('🔄 Catálogo de 22 rubros restaurado.');
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <RotateCcw size={14} />
                          <span>Cargar Catálogo Oficial (22 Rubros)</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedItems.map(item => {
                  const isLoss = item.gananciaTotalEmpaqueUSD <= 0;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isLoss
                          ? 'bg-red-50/20 dark:bg-red-950/20 hover:bg-red-50/40 dark:hover:bg-red-950/30'
                          : 'hover:bg-gray-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* 1. Rubro */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl shrink-0">{item.icono}</span>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-gray-900 dark:text-white block text-sm">
                                {item.nombre}
                              </span>
                              {item.esServicio && (
                                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-1.5 py-0.2 rounded">
                                  ⚡ Servicio
                                </span>
                              )}
                              {item.codigoSku && (
                                <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 px-1.5 py-0.2 rounded">
                                  {item.codigoSku}
                                </span>
                              )}
                              {isLoss && (
                                <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <AlertTriangle size={11} />
                                  <span>Bajo Costo</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">
                                {item.categoria} {item.proveedor ? `• ${item.proveedor}` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => onOpenEditModal(item)}
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                                  item.tipoFormulaItem && item.tipoFormulaItem !== 'heredar_global'
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-200'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200'
                                }`}
                                title={`Editar fórmula: ${CostingCalculator.getItemFormulaDescriptor(item, tasas).notacion}`}
                              >
                                {item.tipoFormulaItem && item.tipoFormulaItem !== 'heredar_global' ? '🛠️ Propia' : '🌐 Global'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Empaque y Peso */}
                      <td className="p-3.5 text-gray-700 dark:text-slate-300">
                        <div className="font-bold">
                          {item.tipoEmpaque} {item.esServicio ? `(${item.pesoEmpaqueKg} unidades)` : `de ${item.pesoEmpaqueKg} Kg`}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-slate-400 font-semibold">
                          {item.esServicio ? (
                            <span className="text-blue-600 dark:text-blue-400">Actividad / Tarifa Fija</span>
                          ) : (
                            `${item.pesoEmpaqueKg} Kg aprovechables`
                          )}
                        </div>
                      </td>

                      {/* 3. Costo de Compra */}
                      <td className="p-3.5">
                        <div className="font-black text-gray-900 dark:text-white">
                          {item.monedaCosto === 'COP'
                            ? CostingCalculator.formatCOP(item.costoEmpaque)
                            : item.monedaCosto === 'USD'
                              ? CostingCalculator.formatUSD(item.costoEmpaque)
                              : CostingCalculator.formatVES(item.costoEmpaque)}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">
                          Total: {CostingCalculator.formatUSD(item.costoTotalEmpaqueUSD)}
                        </div>
                      </td>

                      {/* 4. Costo Real por Kilo */}
                      <td className="p-3.5 text-right font-black text-gray-900 dark:text-white">
                        <div className="text-sm">{CostingCalculator.formatUSD(item.costoKiloUSD)} / Kg</div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                          {CostingCalculator.formatVES(item.costoKiloVES)}
                        </div>
                      </td>

                      {/* 5. Margen Deseado (Editable en línea) */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700">
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max="100"
                            value={item.margenPorcentaje}
                            onChange={e => onUpdateItemMargin(item.id, parseLocaleNumber(e.target.value, 0))}
                            className="w-10 bg-transparent text-center font-black text-xs text-emerald-600 dark:text-emerald-400 outline-none"
                          />
                          <span className="text-[11px] font-bold text-gray-500">%</span>
                        </div>
                      </td>

                      {/* 6. PRECIO VENTA AL DETAL (DESTACADO OFICIAL) */}
                      <td className="p-3.5 text-right bg-emerald-50/40 dark:bg-emerald-950/20">
                        <div className="text-base font-black text-emerald-800 dark:text-emerald-300">
                          {CostingCalculator.formatVES(item.precioVentaDetalKiloVES)}
                        </div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {CostingCalculator.formatUSD(item.precioVentaDetalKiloUSD)} {item.esServicio ? `x ${item.tipoEmpaque}` : '/ Kg'}
                        </div>
                      </td>

                      {/* 7. Precio al Mayor */}
                      <td className="p-3.5 text-right">
                        <div className="font-extrabold text-blue-700 dark:text-blue-400 text-xs sm:text-sm">
                          {CostingCalculator.formatVES(item.precioVentaMayorKiloVES)} {item.esServicio ? `x ${item.tipoEmpaque}` : '/ Kg'}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">
                          {item.tipoEmpaque}: {CostingCalculator.formatUSD(item.precioVentaMayorEmpaqueUSD)}
                        </div>
                      </td>

                      {/* 8. Ganancia por Saco */}
                      <td className={`p-3.5 text-right font-black ${isLoss ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <div>+{CostingCalculator.formatUSD(item.gananciaTotalEmpaqueUSD)}</div>
                        <div className="text-[11px] font-semibold text-gray-500">
                          +{CostingCalculator.formatVES(item.gananciaTotalEmpaqueVES)}
                        </div>
                      </td>

                      {/* 9. Acciones */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditModal(item)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
                            title="Editar costeo"
                            aria-label={`Editar ${item.nombre}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar ${item.nombre} de la hoja de costeo?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer active:scale-95"
                            title="Eliminar rubro"
                            aria-label={`Eliminar ${item.nombre}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
