import React from 'react';
import { X, Trash2 } from 'lucide-react';
import type { CotizadorProduct, CotizadorRates, MonedaCostoOrigen } from '../../types/cotizador';
import { calculateUniversalPrice, CotizadorCalculator } from '../../utils/cotizadorCalculator';

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: CotizadorProduct | null;
  rates: CotizadorRates;
  modalMoneda: MonedaCostoOrigen;
  modalCosto: number;
  modalMargen: number;
  modalDirectUSD: number;
  onModalMonedaChange: (moneda: MonedaCostoOrigen) => void;
  onModalCostoChange: (costo: number) => void;
  onModalMargenChange: (margen: number) => void;
  onClose: () => void;
  onSaveProduct: (newProd: CotizadorProduct, isEditing: boolean) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  editingProduct,
  rates,
  modalMoneda,
  modalCosto,
  modalMargen,
  modalDirectUSD,
  onModalMonedaChange,
  onModalCostoChange,
  onModalMargenChange,
  onClose,
  onSaveProduct,
  onDeleteProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e3256] rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in text-gray-900 dark:text-white">
        
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>{editingProduct ? '✏️ Editar Rubro' : '➕ Nuevo Rubro'}</span>
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal de producto"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = (form.elements.namedItem('name') as HTMLInputElement).value;
            const category = (form.elements.namedItem('category') as HTMLSelectElement).value as CotizadorProduct['categoria'];
            const unit = (form.elements.namedItem('unit') as HTMLSelectElement).value as CotizadorProduct['unidadDefecto'];
            const icon = (form.elements.namedItem('icon') as HTMLInputElement).value || '🥬';
            const avgKg = parseFloat((form.elements.namedItem('avgKg') as HTMLInputElement).value) || 1.0;
            const tara = parseFloat((form.elements.namedItem('tara') as HTMLInputElement).value) || 0;

            const priceCalc = calculateUniversalPrice(
              {
                monedaCosto: modalMoneda,
                costoOrigen: modalCosto,
                margenPorcentaje: modalMargen,
                precioBaseUSD: modalDirectUSD
              },
              rates
            );

            const newProd: CotizadorProduct = {
              id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
              nombre: name,
              categoria: category,
              unidadDefecto: unit,
              precioBaseUSD: priceCalc.precioRefDolarBCV,
              monedaCosto: modalMoneda,
              costoOrigen: modalCosto > 0 ? modalCosto : undefined,
              margenPorcentaje: modalMargen,
              costoBaseCOP: modalMoneda === 'COP' && modalCosto > 0 ? modalCosto : undefined,
              icono: icon,
              pesoPromedioDefectoKg: avgKg,
              taraDefectoKg: tara,
              permitePesajeBalanza: true,
              descripcion: ''
            };

            onSaveProduct(newProd, !!editingProduct);
          }}
          className="flex flex-col gap-3.5 text-xs sm:text-sm"
        >
          <div>
            <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">Nombre del Rubro</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={editingProduct?.nombre || ''}
              placeholder="Ej. Tomate Perita, Papa Amarilla, Plátano..."
              className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">Categoría</label>
              <select
                name="category"
                defaultValue={editingProduct?.categoria || 'hortalizas'}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none min-h-[44px] focus:border-blue-500"
              >
                <option value="hortalizas">🥦 Hortalizas</option>
                <option value="frutas">🍎 Frutas</option>
                <option value="tuberculos">🥔 Tubérculos</option>
                <option value="alinos">🌿 Aliños</option>
                <option value="viveres">🛒 Víveres</option>
                <option value="otros">📦 Otros</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">Unidad de Venta</label>
              <select
                name="unit"
                defaultValue={editingProduct?.unidadDefecto || 'Kg'}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none min-h-[44px] focus:border-blue-500"
              >
                <option value="Kg">Kilogramo (Kg)</option>
                <option value="g">Gramo (g)</option>
                <option value="lb">Libra (lb)</option>
                <option value="Unidad">Unidad</option>
                <option value="Manojo">Manojo</option>
                <option value="Saco">Saco</option>
                <option value="Cesta">Cesta</option>
                <option value="Paquete">Paquete</option>
              </select>
            </div>
          </div>

          {/* Sección de Origen Multimoneda & Precio Referencial Dólar BCV */}
          <div className="bg-gray-50 dark:bg-slate-950/80 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300">Origen de Costo de Compra</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">Pivote: Dólar BCV</span>
            </div>

            {/* Tabs de Moneda de Compra BodegApp Style */}
            <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-[#131b2e] p-1 rounded-xl border border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onModalMonedaChange('COP')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                  modalMoneda === 'COP' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
                }`}
              >
                🇨🇴 En COP
              </button>
              <button
                type="button"
                onClick={() => onModalMonedaChange('USD')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                  modalMoneda === 'USD' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
                }`}
              >
                🇺🇸 En USD ($)
              </button>
              <button
                type="button"
                onClick={() => onModalMonedaChange('VES')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                  modalMoneda === 'VES' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-300 hover:text-gray-900'
                }`}
              >
                🇻🇪 En Bs.
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">
                  {modalMoneda === 'COP' ? 'Costo Compra (COP)' : modalMoneda === 'USD' ? 'Costo Compra (USD)' : 'Costo Compra (Bs)'}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={modalMoneda === 'COP' ? '1000' : '0.05'}
                  value={modalCosto || ''}
                  onChange={e => onModalCostoChange(parseFloat(e.target.value) || 0)}
                  placeholder={modalMoneda === 'COP' ? 'Ej. 90000' : modalMoneda === 'USD' ? 'Ej. 1.20' : 'Ej. 40'}
                  className="w-full bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">
                  {modalMoneda === 'COP' ? 'Fórmula Feria' : 'Margen (%)'}
                </label>
                {modalMoneda === 'COP' ? (
                  <div className="p-2.5 bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-slate-300 text-center font-bold min-h-[44px] flex items-center justify-center">
                    ÷{rates.tasaCompraCOP_USDT || 3150} ×{rates.factorMargen || 880} ÷{rates.tasaDivisaBCV || 765}
                  </div>
                ) : (
                  <input
                    type="number"
                    inputMode="decimal"
                    step="5"
                    min="0"
                    value={modalMargen}
                    onChange={e => onModalMargenChange(parseFloat(e.target.value) || 0)}
                    placeholder="25"
                    className="w-full bg-white dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                  />
                )}
              </div>
            </div>

            {/* Preview de Precios Resultantes en el Modal */}
            {(() => {
              const preview = calculateUniversalPrice(
                {
                  monedaCosto: modalMoneda,
                  costoOrigen: modalCosto,
                  margenPorcentaje: modalMargen,
                  precioBaseUSD: modalDirectUSD
                },
                rates
              );
              return (
                <div className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-purple-700 dark:text-purple-300">PRECIO REF. DÓLAR BCV:</span>
                    <span className="text-purple-900 dark:text-purple-100 text-sm sm:text-base font-extrabold">${preview.precioRefDolarBCV.toFixed(2)} / Kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold border-t border-gray-100 dark:border-slate-800 pt-1.5">
                    <span className="text-blue-700 dark:text-blue-400 font-bold">Precio Venta Oficial BCV:</span>
                    <span className="text-gray-900 dark:text-white text-sm sm:text-base font-black">{CotizadorCalculator.formatBCV(preview.precioBCV)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">Emoji</label>
              <input
                name="icon"
                type="text"
                defaultValue={editingProduct?.icono || '🥬'}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-center text-gray-900 dark:text-white text-lg outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">Peso Prom (Kg)</label>
              <input
                name="avgKg"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.001"
                defaultValue={editingProduct?.pesoPromedioDefectoKg || 1.00}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white text-center outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1.5 block">Tara (Kg)</label>
              <input
                name="tara"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                defaultValue={editingProduct?.taraDefectoKg || 0}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white text-center outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-200 dark:border-slate-800">
            {editingProduct && (
              <button
                type="button"
                onClick={() => onDeleteProduct(editingProduct.id)}
                className="mr-auto text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 min-h-[42px] transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Eliminar</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl min-h-[42px] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md min-h-[42px] transition-all cursor-pointer"
            >
              Guardar Rubro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
