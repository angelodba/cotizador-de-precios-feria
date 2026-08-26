import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  ShoppingCart,
  Layers,
  X,
  RotateCcw
} from 'lucide-react';
import type { CotizadorProduct, CotizadorRates, CotizadorCategoria } from '../../types/cotizador';
import { COTIZADOR_CATEGORIES } from '../../utils/cotizadorData';
import { CotizadorCalculator, calculateUniversalPrice } from '../../utils/cotizadorCalculator';

interface InventarioViewProps {
  products: CotizadorProduct[];
  rates: CotizadorRates;
  onOpenCreateProductModal: () => void;
  onOpenEditProductModal: (product: CotizadorProduct) => void;
  onAddProductToQuote: (product: CotizadorProduct) => void;
  onResetProducts: () => void;
  onShowToast: (msg: string) => void;
}

export const InventarioView: React.FC<InventarioViewProps> = ({
  products,
  rates,
  onOpenCreateProductModal,
  onOpenEditProductModal,
  onAddProductToQuote,
  onResetProducts,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CotizadorCategoria | 'todas'>('todas');

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'todas' || p.categoria === selectedCategory;
    const matchSearch = !searchQuery.trim() || p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* HEADER DE INVENTARIO BODEGAPP */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Inventario de Rubros
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            Administra los rubros, precios y costos de compra en COP, USD y Bolívares.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('¿Restaurar lista de rubros predeterminados?')) {
                onResetProducts();
                onShowToast('🔄 Catálogo restaurado con éxito.');
              }
            }}
            className="px-3.5 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-gray-200 dark:border-slate-700 transition-all min-h-[44px]"
            title="Restaurar lista oficial de productos"
          >
            <RotateCcw size={15} />
            <span>Predeterminados</span>
          </button>

          <button
            onClick={onOpenCreateProductModal}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-5 rounded-xl font-bold text-sm shadow-md shadow-blue-950/30 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Plus size={18} />
            <span>Nuevo Rubro</span>
          </button>
        </div>
      </header>

      {/* BARRA DE BÚSQUEDA Y CATEGORÍAS */}
      <div className="bg-white dark:bg-[#0f172a] p-3.5 sm:p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-[#1e3256] mb-6 flex flex-col gap-3 sticky top-0 z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar rubro por nombre..."
            className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-slate-700 rounded-xl leading-5 bg-gray-50 dark:bg-[#131b2e] text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Píldoras de Categoría */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {COTIZADOR_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] shrink-0 border ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700'
              }`}
            >
              <span>{cat.icono}</span>
              <span>{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE RUBROS CON TARJETAS LIMPIAS ESTILO BODEGAPP */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-[#1e3256] p-8 shadow-sm">
            <Layers size={48} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              No se encontraron rubros
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No hay coincidencias para "${searchQuery}".`
                : 'Crea tu primer rubro con el botón "Nuevo Rubro".'}
            </p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const prices = calculateUniversalPrice(
              {
                monedaCosto: product.monedaCosto,
                costoOrigen: product.costoOrigen,
                margenPorcentaje: product.margenPorcentaje,
                costoBaseCOP: product.costoBaseCOP,
                precioBaseUSD: product.precioBaseUSD
              },
              rates
            );

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Lado Izquierdo: Emoji e Información */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    {product.icono || '🥬'}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white tracking-tight uppercase truncate" title={product.nombre}>
                      {product.nombre}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5 flex-wrap">
                      <span className="capitalize">{product.categoria}</span>
                      <span>•</span>
                      <span>Venta por {product.unidadDefecto}</span>
                      {product.costoOrigen && (
                        <>
                          <span>•</span>
                          <span>Costo: {product.monedaCosto === 'COP' ? `${product.costoOrigen} COP` : `$${product.costoOrigen}`}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Precios y Acciones */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
                      PRECIO BCV
                    </span>
                    <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 block tracking-tight">
                      {CotizadorCalculator.formatBCV(prices.precioBCV)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold block">
                      (${prices.precioRefDolarBCV.toFixed(2)} USD)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAddProductToQuote(product);
                        onShowToast(`🛒 ${product.nombre} añadido a la cotización.`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 min-h-[38px] active:scale-95 cursor-pointer"
                      title="Agregar a cotización activa"
                    >
                      <ShoppingCart size={15} />
                      <span>+ Cotizar</span>
                    </button>

                    <button
                      onClick={() => onOpenEditProductModal(product)}
                      className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 transition-all flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                      title="Editar rubro y costo"
                    >
                      <Pencil size={15} />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
