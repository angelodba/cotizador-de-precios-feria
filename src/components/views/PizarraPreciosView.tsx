import React, { useMemo } from 'react';
import {
  Printer,
  Share2,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Copy,
  Check
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

export const PizarraPreciosView: React.FC<PizarraPreciosViewProps> = ({
  items,
  tasas,
  onNavigateTab,
  onShowToast
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const calculatedItems = useMemo(() => {
    return items.map(item => CostingCalculator.calculateItem(item, tasas));
  }, [items, tasas]);

  const handlePrint = () => {
    hapticFeedback('light');
    window.print();
  };

  const getWhatsAppText = () => {
    let text = `📢 *LISTA OFICIAL DE PRECIOS — FERIA LOS CAFETEROS*\n`;
    text += `📅 *Semana:* ${new Date().toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `🇻🇪 *Tasa Oficial BCV:* ${tasas.tasaBCV.toFixed(2)} Bs/$\n`;
    text += `-------------------------------------------\n`;
    text += `🛒 *PRECIOS DE VENTA POR KILO (AL DETAL):*\n\n`;

    calculatedItems.forEach(item => {
      text += `${item.icono || '🥬'} *${item.nombre}*\n`;
      text += `   • *${CostingCalculator.formatVES(item.precioVentaDetalKiloVES)}* (${CostingCalculator.formatUSD(item.precioVentaDetalKiloUSD)} / ${item.esServicio ? 'Serv' : 'Kg'})\n`;
      if (!item.esServicio && item.precioVentaMayorEmpaqueVES > 0) {
        text += `   • _Mayorista (${item.tipoEmpaque}): ${CostingCalculator.formatVES(item.precioVentaMayorEmpaqueVES)} (${CostingCalculator.formatUSD(item.precioVentaMayorEmpaqueUSD)})_\n`;
      }
      text += `\n`;
    });

    text += `-------------------------------------------\n`;
    text += `✨ _Precios fijados por kilo según tasa oficial BCV._\n`;
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
    calculatedItems.forEach(it => {
      csv += `"${it.nombre}","${it.categoria}","${it.tipoEmpaque}",${it.pesoEmpaqueKg},${it.costoTotalEmpaqueUSD},${it.costoKiloUSD},${it.costoKiloVES},${it.margenPorcentaje},${it.precioVentaDetalKiloVES},${it.precioVentaDetalKiloUSD},${it.precioVentaMayorKiloVES},${it.precioVentaMayorEmpaqueUSD}\n`;
    });

    const fileName = `lista_precios_feria_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadFileMobile(csv, fileName, 'text/csv;charset=utf-8;');
    onShowToast('📊 Archivo CSV descargado con éxito.');
  };

  return (
    <div className="flex-1 flex flex-col p-3.5 sm:p-6 md:p-8 pb-28 sm:pb-8 overflow-y-auto max-w-5xl mx-auto w-full gap-5 sm:gap-6 touch-scroll">
      
      {/* HEADER DE LA PIZARRA */}
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

      {/* ─── CARTELERA / PIZARRA OFICIAL DE PRECIOS IMPRIMIBLE ──────── */}
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm flex flex-col gap-5 sm:gap-6 text-gray-900 dark:text-white">
        
        {/* Cabecera Oficial de la Pizarra */}
        <div className="text-center border-b border-gray-200 dark:border-slate-800 pb-4 sm:pb-5">
          <span className="text-xs sm:text-sm font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
            Feria Los Cafeteros
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-1 tracking-tight">
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
              <span>Tasa Oficial BCV: {tasas.tasaBCV.toFixed(2)} Bs/$</span>
            </span>
          </div>
        </div>

        {/* Cuadrícula de Precios para Clientes / Puesto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {calculatedItems.map(item => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs gap-2.5"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0">{item.icono}</span>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{item.nombre}</span>
                    {item.esServicio && (
                      <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 px-1.5 py-0.2 rounded shrink-0">
                        Servicio
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium truncate block">
                    {item.categoria} • {item.esServicio ? `Tarifa por ${item.tipoEmpaque}` : 'Venta por Kilo'}
                  </span>
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

        {/* Pie de Pizarra */}
        <div className="text-center pt-3 sm:pt-4 border-t border-gray-200 dark:border-slate-800 text-[11px] sm:text-xs text-gray-400">
          Precios fijados por Kilo según cotización oficial BCV • Venta al mayor disponible por saco completo
        </div>

      </div>

    </div>
  );
};
