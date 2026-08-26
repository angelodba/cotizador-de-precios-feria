import React from 'react';
import { Search, Plus, RotateCcw, X, Layers } from 'lucide-react';
import type { CotizadorProduct, CotizadorCategoria } from '../../types/cotizador';
import { COTIZADOR_CATEGORIES, WEIGHT_UNIT_CONVERSIONS } from '../../utils/cotizadorData';
import { CotizadorCalculator } from '../../utils/cotizadorCalculator';
import { ProductCard } from './ProductCard';

interface CatalogSectionProps {
  products: CotizadorProduct[];
  filteredProducts: CotizadorProduct[];
  selectedCategory: CotizadorCategoria | 'todas';
  searchQuery: string;
  onSelectCategory: (cat: CotizadorCategoria | 'todas') => void;
  onSearchChange: (q: string) => void;
  onResetDefaults: () => void;
  onOpenCreateModal: () => void;
  calculator: CotizadorCalculator;
  quickPresets: { label: string; value: number }[];
  onAddProduct: (product: CotizadorProduct, amount?: number) => void;
  onEditProduct: (product: CotizadorProduct) => void;
  highContrast?: boolean;
  mobileTab: 'catalogo' | 'cotizacion' | 'ambos';
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  filteredProducts,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearchChange,
  onResetDefaults,
  onOpenCreateModal,
  calculator,
  quickPresets,
  onAddProduct,
  onEditProduct,
  mobileTab
}) => {
  return (
    <section className={`xl:col-span-6 bg-white dark:bg-[#0f172a] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm border border-gray-200 dark:border-slate-800 transition-all ${
      mobileTab === 'cotizacion' ? 'hidden xl:flex' : 'flex'
    }`}>
      
      {/* Cabecera del Catálogo Limpia & Minimalista */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Catálogo de Rubros</span>
              <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">
                {products.length}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefaults}
            className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-xl transition-all"
            title="Restaurar lista predeterminada"
          >
            <RotateCcw size={15} />
          </button>
          
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 min-h-[38px] cursor-pointer"
          >
            <Plus size={16} />
            <span>Nuevo Rubro</span>
          </button>
        </div>
      </div>

      {/* Buscador Rápido Espacioso */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar tomate, papa, cambur, cebolla..."
          className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Categorías Filtro - Píldoras Limpias */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {COTIZADOR_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] shrink-0 border ${
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

      {/* Cuadrícula de Productos Limpia & Ergonómica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 flex flex-col items-center gap-2 bg-gray-50 dark:bg-[#131b2e] rounded-2xl border border-gray-200 dark:border-slate-800">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">No se encontraron rubros con "{searchQuery}"</p>
            <button
              onClick={() => onSearchChange('')}
              className="mt-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Limpiar filtro de búsqueda
            </button>
          </div>
        ) : (
          filteredProducts.map(product => {
            const prices = calculator.calculateUnitPrices(product);
            const unitDef = WEIGHT_UNIT_CONVERSIONS[product.unidadDefecto];
            
            return (
              <ProductCard
                key={product.id}
                product={product}
                prices={prices}
                unitDef={unitDef}
                quickPresets={quickPresets}
                onAdd={onAddProduct}
                onEdit={onEditProduct}
              />
            );
          })
        )}
      </div>
    </section>
  );
};
