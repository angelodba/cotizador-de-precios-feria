import React, { useState, useMemo } from 'react';
import {
  Printer,
  Share2,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Copy,
  Check,
  Search,
  LayoutGrid,
  List,
  Sparkles,
  Tag,
  PackageCheck
} from 'lucide-react';
import type { ItemCosteo, TasasCosteo, CostingTab } from '../../types/costing';
import { CostingCalculator } from '../../utils/costingCalculator';
import { copyToClipboardMobile, shareMobileOrWhatsApp, hapticFeedback, downloadFileMobile } from '../../utils/mobileUtils';

interface PizarraPreciosViewProps {
  items: ItemCosteo[];
  tasas: TasasCosteo;
  onNavigateTab: (tab: CostingTab) => void;
  onShowToast: (msg: string) => void;
}

type ViewMode = 'grid' | 'table';

export const PizarraPreciosView: React.FC<PizarraPreciosViewProps> = ({
  items,
  tasas,
  onNavigateTab,
  onShowToast
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Calcular todos los items con el motor de costeo
  const calculatedItems = useMemo(() => {
    return items.map(item => CostingCalculator.calculateItem(item, tasas));
  }, [items, tasas]);

  // Lista de categorías únicas presentes
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(it => {
      if (it.categoria) cats.add(it.categoria);
    });
    return Array.from(cats);
  }, [items]);

  // Filtrado de items por búsqueda y categoría
  const filteredItems = useMemo(() => {
    return calculatedItems.filter(item => {
      const matchSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.categoria === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [calculatedItems, searchTerm, selectedCategory]);

  const handlePrint = () => {
    hapticFeedback('light');
    window.print();
  };

  const getWhatsAppText = () => {
    let text = `📢 *LISTA OFICIAL DE PRECIOS — FERIA LOS CAFETEROS*\n`;
    text += `📅 *Fecha:* ${new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `🇻🇪 *Tasa Oficial BCV:* ${tasas.tasaBCV.toFixed(2)} Bs/$\n`;
    text += `-------------------------------------------\n`;
    text += `🛒 *PRECIOS DE VENTA POR KILO (AL DETAL):*\n\n`;

    filteredItems.forEach(item => {
      text += `${item.icono || '🥬'} *${item.nombre}*\n`;
      text += `   • *${CostingCalculator.formatVES(item.precioVentaDetalKiloVES)}* (${CostingCalculator.formatUSD(item.precioVentaDetalKiloUSD)} / ${item.esServicio ? item.tipoEmpaque : 'Kg'})\n`;
      if (!item.esServicio && item.precioVentaMayorEmpaqueVES > 0) {
        text += `   • _Mayorista (${item.tipoEmpaque} ${item.pesoEmpaqueKg}Kg): ${CostingCalculator.formatVES(item.precioVentaMayorEmpaqueVES)} (${CostingCalculator.formatUSD(item.precioVentaMayorEmpaqueUSD)})_\n`;
      }
      text += `\n`;
    });

    text += `-------------------------------------------\n`;
    text += `✨ _Precios fijados según cotización oficial BCV._\n`;
    text += `📞 _Pedidos y despachos al mayor disponibles._`;
    return text;
  };

  const handleShare = async () => {
    hapticFeedback('medium');
    const text = getWhatsAppText();
    const result = await shareMobileOrWhatsApp('Pizarra de Precios - Feria Los Cafeteros', text);
    if (result.shared) {
      if (result.method === 'native') {
        onShowToast('📲 Pizarra compartida con éxito.');
      } else {
        onShowToast('💬 Abriendo WhatsApp...');
      }
    }
  };

  const handleCopyText = async () => {
    hapticFeedback('light');
    const text = getWhatsAppText();
    const success = await copyToClipboardMobile(text);
    if (success) {
      setCopied(true);
      hapticFeedback('success');
      onShowToast('📋 Lista de precios copiada al portapapeles.');
      setTimeout(() => setCopied(false), 3000);
    } else {
      onShowToast('❌ No se pudo copiar automáticamente.');
    }
  };

  const handleExportCSV = () => {
    hapticFeedback('medium');
    let csv = 'Rubro,Categoria,Empaque,Peso Kg,Costo Total USD,Costo x Kilo USD,Costo x Kilo Bs,Margen %,Precio Detal Kilo Bs,Precio Detal Kilo USD,Precio Mayor Kilo Bs,Precio Mayor Saco USD\n';
    filteredItems.forEach(it => {
      csv += `"${it.nombre}","${it.categoria}","${it.tipoEmpaque}",${it.pesoEmpaqueKg},${it.costoTotalEmpaqueUSD},${it.costoKiloUSD},${it.costoKiloVES},${it.margenPorcentaje},${it.precioVentaDetalKiloVES},${it.precioVentaDetalKiloUSD},${it.precioVentaMayorKiloVES},${it.precioVentaMayorEmpaqueUSD}\n`;
    });

    const fileName = `lista_precios_feria_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFileMobile(csv, fileName, 'text/csv;charset=utf-8;');
    onShowToast('📊 Archivo CSV descargado con éxito.');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-28 sm:pb-8 overflow-y-auto max-w-5xl mx-auto w-full gap-5 sm:gap-6 touch-scroll">
      
      {/* ─── HEADER Y BOTONES DE ACCIÓN ─── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-3 sm:pb-4">
        <button
          onClick={() => onNavigateTab('hoja_costeo')}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer min-h-[38px] active:scale-95 self-start"
        >
          <ArrowLeft size={16} />
          <span>Volver a Hoja de Costeo</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyText}
            className="px-3 sm:px-3.5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 transition-all cursor-pointer min-h-[42px] active:scale-95"
            aria-label="Copiar texto de precios"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
            <span>Copiar Texto</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 sm:px-3.5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 transition-all cursor-pointer min-h-[42px] active:scale-95"
            aria-label="Exportar a CSV"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden xs:inline">Excel / CSV</span>
            <span className="xs:hidden">Excel</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer min-h-[42px]"
            aria-label="Compartir en WhatsApp o redes"
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer min-h-[42px]"
            aria-label="Imprimir cartelera"
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* ─── FILTROS Y BUSCADOR INTERACTIVO ─── */}
      <div className="no-print flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50 dark:bg-[#131b2e] p-3 rounded-2xl border border-gray-200 dark:border-slate-800">
        
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar rubro por nombre o categoría..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 shadow-xs"
          />
        </div>

        {/* Categorías y Selector de Vista */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 touch-scroll">
          <button
            onClick={() => {
              hapticFeedback('light');
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100'
            }`}
          >
            Todos ({calculatedItems.length})
          </button>

          {availableCategories.map(cat => {
            const count = calculatedItems.filter(it => it.categoria === cat).length;
            return (
              <button
                key={cat}
                onClick={() => {
                  hapticFeedback('light');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}

          <div className="hidden sm:flex items-center bg-white dark:bg-[#0f172a] p-0.5 rounded-xl border border-gray-200 dark:border-slate-700 shrink-0 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
              }`}
              title="Vista de Tarjetas / Cartelera"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-white'
              }`}
              title="Vista de Tabla / Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── CARTELERA / PIZARRA OFICIAL DE PRECIOS IMPRIMIBLE ──────── */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col gap-5 sm:gap-6 text-gray-900 dark:text-white">
        
        {/* Cabecera Oficial de la Pizarra */}
        <div className="text-center border-b border-gray-200 dark:border-slate-800 pb-4 sm:pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={13} />
            <span>Feria Los Cafeteros</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            PIZARRA OFICIAL DE PRECIOS
          </h1>
          
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-gray-500 dark:text-slate-400 mt-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-blue-500" />
              <span>Semana del {new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-500" />
              <span>Tasa Oficial BCV: <strong className="text-gray-900 dark:text-white">{tasas.tasaBCV.toFixed(2)} Bs/$</strong></span>
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="flex items-center gap-1">
              <PackageCheck size={14} className="text-purple-500" />
              <span>{filteredItems.length} Rubros Cotizados</span>
            </span>
          </div>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center gap-2">
            <span className="text-4xl">🔍</span>
            <h3 className="font-extrabold text-base text-gray-700 dark:text-slate-300">No se encontraron rubros</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              No hay productos que coincidan con la búsqueda o categoría seleccionada.
            </p>
          </div>
        )}

        {/* ─── VISTA 1: CUADRÍCULA / CARTELERA ─── */}
        {viewMode === 'grid' && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs gap-2.5 transition-all hover:border-blue-300 dark:hover:border-blue-800"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="text-2xl sm:text-3xl shrink-0">{item.icono || '🥬'}</span>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{item.nombre}</span>
                      {item.esServicio && (
                        <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-1.5 py-0.2 rounded shrink-0">
                          Servicio
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      <span className="inline-flex items-center gap-0.5">
                        <Tag size={11} className="text-gray-400" />
                        <span>{item.categoria}</span>
                      </span>
                      <span>•</span>
                      <span>{item.esServicio ? `Tarifa por ${item.tipoEmpaque}` : `Venta por Kilo (${item.tipoEmpaque})`}</span>
                    </div>

                    {!item.esServicio && item.precioVentaMayorEmpaqueVES > 0 && (
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1">
                        Saco {item.pesoEmpaqueKg}Kg: {CostingCalculator.formatVES(item.precioVentaMayorEmpaqueVES)} ({CostingCalculator.formatUSD(item.precioVentaMayorEmpaqueUSD)})
                      </div>
                    )}
                  </div>
                </div>

                {/* Precios Bs y USD */}
                <div className="text-right shrink-0">
                  <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {CostingCalculator.formatVES(item.precioVentaDetalKiloVES)}
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-slate-400">
                    {CostingCalculator.formatUSD(item.precioVentaDetalKiloUSD)} {item.esServicio ? `x ${item.tipoEmpaque}` : 'x Kg'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── VISTA 2: TABLA / LISTA ─── */}
        {viewMode === 'table' && filteredItems.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-[#131b2e] text-gray-500 dark:text-slate-400 text-[11px] font-extrabold uppercase border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Rubro</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-center">Presentación</th>
                  <th className="p-3 text-right">Precio Detal ($ USD)</th>
                  <th className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">Precio Detal (Bs.)</th>
                  <th className="p-3 text-right">Mayor Saco (Bs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{item.icono || '🥬'}</span>
                      <span>{item.nombre}</span>
                    </td>
                    <td className="p-3 text-gray-500 dark:text-slate-400 font-medium">
                      {item.categoria}
                    </td>
                    <td className="p-3 text-center text-gray-600 dark:text-slate-300 font-semibold">
                      {item.tipoEmpaque} ({item.pesoEmpaqueKg} Kg)
                    </td>
                    <td className="p-3 text-right font-bold text-gray-700 dark:text-slate-200">
                      {CostingCalculator.formatUSD(item.precioVentaDetalKiloUSD)}
                    </td>
                    <td className="p-3 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {CostingCalculator.formatVES(item.precioVentaDetalKiloVES)}
                    </td>
                    <td className="p-3 text-right font-bold text-purple-600 dark:text-purple-400">
                      {item.precioVentaMayorEmpaqueVES > 0 ? CostingCalculator.formatVES(item.precioVentaMayorEmpaqueVES) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pie de Pizarra */}
        <div className="text-center pt-3 sm:pt-4 border-t border-gray-200 dark:border-slate-800 text-[11px] sm:text-xs text-gray-400">
          Precios oficiales fijados según cotización BCV • Venta al mayor y despachos disponibles
        </div>

      </div>

    </div>
  );
};
