import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Package,
  Truck,
  ChevronDown,
  ChevronUp,
  Calculator,
  Layers,
  Wrench
} from 'lucide-react';
import type {
  ItemCosteo,
  TasasCosteo,
  TipoEmpaque,
  MonedaCosto,
  TipoTasaCosto,
  CategoriaRubro,
  CategoriaDef,
  EstrategiaFormulaItem,
  FormulaPersonalizadaCosteo,
  PasoFormulaCustom,
  OperadorPasoFormula,
  VariableEntradaFormula,
  MonedaSalidaFormula,
  TipoValorPaso
} from '../../types/costing';
import { CostingCalculator } from '../../utils/costingCalculator';
import { parseLocaleNumber, hapticFeedback } from '../../utils/mobileUtils';
import { CSV_DEFAULT_BASE_PRICES_USDT, DEFAULT_CATEGORIES, DEFAULT_EMPAQUES } from '../../utils/initialCostingData';

interface CosteoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: ItemCosteo | null;
  tasas: TasasCosteo;
  customCategories?: CategoriaDef[];
  onSaveItem: (item: ItemCosteo) => void;
  onDeleteItem?: (id: string) => void;
  onAddCustomCategory?: (category: CategoriaDef) => void;
}

const EXTENDED_ICONS = [
  '🥔', '🍅', '🧅', '🧄', '🥕', '🥬', '🍌', '🥑', '🍋', '🍇',
  '🫑', '📦', '🍠', '🍉', '🍊', '🍍', '🌽', '🍎', '🥒', '🌿',
  '🍈', '🥦', '🚚', '🚜', '👨‍🌾', '🥩', '🧀', '🥚', '🌾', '☕',
  '🏷️', '🛠️', '⚡', '🛒', '💰', '⚖️'
];

const AUTO_MATCH_RUBROS: Record<string, { categoria: CategoriaRubro; icono: string }> = {
  papa: { categoria: 'Tubérculos', icono: '🥔' },
  tomate: { categoria: 'Hortalizas', icono: '🍅' },
  cebolla: { categoria: 'Hortalizas', icono: '🧅' },
  ajo: { categoria: 'Aliños', icono: '🧄' },
  zanahoria: { categoria: 'Tubérculos', icono: '🥕' },
  lechuga: { categoria: 'Hortalizas', icono: '🥬' },
  platano: { categoria: 'Frutas', icono: '🍌' },
  plátano: { categoria: 'Frutas', icono: '🍌' },
  aguacate: { categoria: 'Frutas', icono: '🥑' },
  limon: { categoria: 'Frutas', icono: '🍋' },
  limón: { categoria: 'Frutas', icono: '🍋' },
  pimenton: { categoria: 'Hortalizas', icono: '🫑' },
  pimentón: { categoria: 'Hortalizas', icono: '🫑' },
  yuca: { categoria: 'Tubérculos', icono: '🥔' },
  batata: { categoria: 'Tubérculos', icono: '🍠' },
  ocumo: { categoria: 'Tubérculos', icono: '🥔' },
  cilantro: { categoria: 'Aliños', icono: '🧄' },
  apio: { categoria: 'Tubérculos', icono: '🥔' },
  patilla: { categoria: 'Frutas', icono: '🍉' },
  melon: { categoria: 'Frutas', icono: '🍈' },
  melón: { categoria: 'Frutas', icono: '🍈' },
  naranja: { categoria: 'Frutas', icono: '🍊' },
  pina: { categoria: 'Frutas', icono: '🍍' },
  piña: { categoria: 'Frutas', icono: '🍍' },
  cambur: { categoria: 'Frutas', icono: '🍌' },
  maiz: { categoria: 'Hortalizas', icono: '🌽' },
  maíz: { categoria: 'Hortalizas', icono: '🌽' },
  flete: { categoria: 'Servicios y Fletes', icono: '🚚' },
  transporte: { categoria: 'Servicios y Fletes', icono: '🚚' },
  empaque: { categoria: 'Empaques e Insumos', icono: '📦' },
  saco: { categoria: 'Empaques e Insumos', icono: '📦' },
  mano: { categoria: 'Servicios y Fletes', icono: '👨‍🌾' },
  queso: { categoria: 'Víveres', icono: '🧀' },
  huevo: { categoria: 'Víveres', icono: '🥚' },
  cafe: { categoria: 'Víveres', icono: '☕' },
  café: { categoria: 'Víveres', icono: '☕' }
};

export const CosteoItemModal: React.FC<CosteoItemModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  tasas,
  customCategories = [],
  onSaveItem,
  onDeleteItem,
  onAddCustomCategory
}) => {
  const [esServicio, setEsServicio] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>('');
  const [categoria, setCategoria] = useState<CategoriaRubro>('Hortalizas');
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryIcon] = useState<string>('🏷️');

  const [icono, setIcono] = useState<string>('🥬');
  const [customEmojiInput, setCustomEmojiInput] = useState<string>('');
  const [tipoEmpaque, setTipoEmpaque] = useState<TipoEmpaque>('Saco');
  const [isCreatingEmpaque, setIsCreatingEmpaque] = useState<boolean>(false);
  const [newEmpaqueName, setNewEmpaqueName] = useState<string>('');

  const [pesoEmpaqueKg, setPesoEmpaqueKg] = useState<number>(45);
  const [monedaCosto, setMonedaCosto] = useState<MonedaCosto>('COP');
  const [tipoTasaCosto, setTipoTasaCosto] = useState<TipoTasaCosto>('bcv');
  const [tasaCompraPersonalizada, setTasaCompraPersonalizada] = useState<number>(tasas.tasaBCV || 76.50);

  const [costoEmpaque, setCostoEmpaque] = useState<number>(90000);
  const [fleteUnitario, setFleteUnitario] = useState<number>(0.50);
  const [mermaPorcentaje, setMermaPorcentaje] = useState<number>(5);
  const [margenPorcentaje, setMargenPorcentaje] = useState<number>(30);
  const [margenMayoristaPorcentaje, setMargenMayoristaPorcentaje] = useState<number>(15);
  const [precioBaseUSDT, setPrecioBaseUSDT] = useState<number>(1.50);
  const [codigoSku, setCodigoSku] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [proveedor, setProveedor] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const customRatesList = tasas.tasasPersonalizadas || [];

  // Soporte de fórmula específica para este rubro
  const [tipoFormulaItem, setTipoFormulaItem] = useState<EstrategiaFormulaItem>('heredar_global');
  const [formulaPersonalizadaItem, setFormulaPersonalizadaItem] = useState<FormulaPersonalizadaCosteo>({
    variableEntrada: 'costo_origen_empaque',
    monedaResultado: 'USD',
    pasos: [
      { id: 'p-1', nombre: 'Paso 1: Tasa Divisor', op: 'div', val: 3.2, tipoValor: 'manual', activo: true },
      { id: 'p-2', nombre: 'Paso 2: Factor Divisa', op: 'div', val: 785, tipoValor: 'manual', activo: true },
      { id: 'p-3', nombre: 'Paso 3: Conversión Kilo', op: 'div', val: 45, tipoValor: 'manual', activo: true }
    ]
  });

  // Lista combinada de categorías
  const combinedCategories = React.useMemo(() => {
    const defaultCats = DEFAULT_CATEGORIES;
    const all = [...defaultCats];
    customCategories.forEach(cc => {
      if (!all.some(c => c.nombre.toLowerCase() === cc.nombre.toLowerCase())) {
        all.push(cc);
      }
    });
    return all;
  }, [customCategories]);

  useEffect(() => {
    if (editingItem) {
      setEsServicio(!!editingItem.esServicio);
      setNombre(editingItem.nombre);
      setCategoria(editingItem.categoria);
      setIcono(editingItem.icono || '🥬');
      setTipoEmpaque(editingItem.tipoEmpaque || 'Saco');
      setPesoEmpaqueKg(editingItem.pesoEmpaqueKg || 1);
      setMonedaCosto(editingItem.monedaCosto || 'COP');
      setTipoTasaCosto(editingItem.tipoTasaCosto || (editingItem.tasaPersonalizadaId ? editingItem.tasaPersonalizadaId : 'bcv'));
      setTasaCompraPersonalizada(editingItem.tasaCompraPersonalizada || tasas.tasaBCV || 76.50);
      setCostoEmpaque(editingItem.costoEmpaque || 0);
      setFleteUnitario(editingItem.fleteUnitario || 0);
      setMermaPorcentaje(editingItem.mermaPorcentaje ?? 5);
      setMargenPorcentaje(editingItem.margenPorcentaje ?? 30);
      setMargenMayoristaPorcentaje(editingItem.margenMayoristaPorcentaje ?? 15);
      setPrecioBaseUSDT(editingItem.precioBaseUSDT || (tasas.preciosBaseUSDT?.[editingItem.nombre] || 1.50));
      setCodigoSku(editingItem.codigoSku || '');
      setDescripcion(editingItem.descripcion || '');
      setProveedor(editingItem.proveedor || '');
      setIsCreatingCategory(false);
      setIsCreatingEmpaque(false);

      // Cargar fórmula personalizada propia del rubro
      setTipoFormulaItem(editingItem.tipoFormulaItem || 'heredar_global');

      if (editingItem.formulaPersonalizadaItem) {
        setFormulaPersonalizadaItem(JSON.parse(JSON.stringify(editingItem.formulaPersonalizadaItem)));
      } else {
        const pesoKg = editingItem.pesoEmpaqueKg || 45;
        setFormulaPersonalizadaItem({
          variableEntrada: 'costo_origen_empaque',
          monedaResultado: 'USD',
          pasos: [
            { id: 'p-1', nombre: 'Paso 1: Tasa Divisor', op: 'div', val: 3.2, tipoValor: 'manual', activo: true },
            { id: 'p-2', nombre: 'Paso 2: Factor Divisa', op: 'div', val: 785, tipoValor: 'manual', activo: true },
            { id: 'p-3', nombre: 'Paso 3: Conversión Kilo', op: 'div', val: pesoKg, tipoValor: 'manual', activo: true }
          ]
        });
      }
    } else {
      setEsServicio(false);
      setNombre('');
      setCategoria('Hortalizas');
      setIcono('🥬');
      setTipoEmpaque('Saco');
      setPesoEmpaqueKg(45);
      setMonedaCosto('COP');
      setTipoTasaCosto('bcv');
      setTasaCompraPersonalizada(tasas.tasaBCV || 76.50);
      setCostoEmpaque(90000);
      setFleteUnitario(0.50);
      setMermaPorcentaje(5);
      setMargenPorcentaje(30);
      setMargenMayoristaPorcentaje(15);
      setPrecioBaseUSDT(1.50);
      setCodigoSku('');
      setDescripcion('');
      setProveedor('');
      setIsCreatingCategory(false);
      setIsCreatingEmpaque(false);

      setTipoFormulaItem('heredar_global');
      setFormulaPersonalizadaItem({
        variableEntrada: 'costo_origen_empaque',
        monedaResultado: 'USD',
        pasos: [
          { id: 'p-1', nombre: 'Paso 1: Tasa Divisor', op: 'div', val: 3.2, tipoValor: 'manual', activo: true },
          { id: 'p-2', nombre: 'Paso 2: Factor Divisa', op: 'div', val: 785, tipoValor: 'manual', activo: true },
          { id: 'p-3', nombre: 'Paso 3: Conversión Kilo', op: 'div', val: 45, tipoValor: 'manual', activo: true }
        ]
      });
    }
  }, [editingItem, isOpen, tasas.preciosBaseUSDT, tasas.tasaBCV]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setNombre(val);
    const lower = val.toLowerCase().trim();
    
    // Auto matching icon & category
    for (const [key, match] of Object.entries(AUTO_MATCH_RUBROS)) {
      if (lower.includes(key)) {
        setCategoria(match.categoria);
        setIcono(match.icono);
        if (match.categoria === 'Servicios y Fletes') {
          setEsServicio(true);
          setMermaPorcentaje(0);
        }
        break;
      }
    }

    // Auto lookup de precio base en CSV si coincide
    for (const [csvKey, basePrice] of Object.entries(CSV_DEFAULT_BASE_PRICES_USDT)) {
      if (lower.includes(csvKey.toLowerCase())) {
        setPrecioBaseUSDT(basePrice);
        break;
      }
    }
  };

  const handleCreateCustomCategory = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (onAddCustomCategory) {
      onAddCustomCategory({
        id: `custom-cat-${Date.now()}`,
        nombre: catName,
        icono: newCategoryIcon,
        esPersonalizada: true
      });
    }
    setCategoria(catName);
    setIcono(newCategoryIcon);
    setIsCreatingCategory(false);
    setNewCategoryName('');
  };

  const handleCreateCustomEmpaque = () => {
    if (!newEmpaqueName.trim()) return;
    setTipoEmpaque(newEmpaqueName.trim());
    setIsCreatingEmpaque(false);
    setNewEmpaqueName('');
  };

  const pasosItemList: PasoFormulaCustom[] = (formulaPersonalizadaItem.pasos && formulaPersonalizadaItem.pasos.length > 0)
    ? formulaPersonalizadaItem.pasos
    : [
        { id: 'p-1', nombre: 'Paso 1: Tasa Divisor', op: 'div', val: 3.2, tipoValor: 'manual', activo: true },
        { id: 'p-2', nombre: 'Paso 2: Factor Divisa', op: 'div', val: 785, tipoValor: 'manual', activo: true },
        { id: 'p-3', nombre: 'Paso 3: Conversión Kilo', op: 'div', val: pesoEmpaqueKg || 45, tipoValor: 'manual', activo: true }
      ];

  const handleUpdateFormulaPersonalizadaItem = (updated: Partial<FormulaPersonalizadaCosteo>) => {
    setFormulaPersonalizadaItem(prev => ({
      ...prev,
      ...updated
    }));
  };

  const handleUpdatePasoItem = (id: string, updatedPaso: Partial<PasoFormulaCustom>) => {
    const next = pasosItemList.map(p => p.id === id ? { ...p, ...updatedPaso } : p);
    handleUpdateFormulaPersonalizadaItem({ pasos: next });
  };

  const handleAddPasoItem = () => {
    const newId = `p-${Date.now()}`;
    const newPaso: PasoFormulaCustom = {
      id: newId,
      nombre: `Paso ${pasosItemList.length + 1}`,
      op: 'div',
      val: 1,
      tipoValor: 'manual',
      activo: true
    };
    handleUpdateFormulaPersonalizadaItem({ pasos: [...pasosItemList, newPaso] });
  };

  const handleDeletePasoItem = (id: string) => {
    if (pasosItemList.length <= 1) return;
    const next = pasosItemList.filter(p => p.id !== id);
    handleUpdateFormulaPersonalizadaItem({ pasos: next });
  };

  const previewItem: ItemCosteo = {
    id: editingItem?.id || 'temp',
    nombre: nombre || (esServicio ? 'Servicio / Actividad' : 'Rubro'),
    categoria,
    icono,
    tipoEmpaque,
    pesoEmpaqueKg,
    monedaCosto,
    tipoTasaCosto,
    tasaCompraPersonalizada,
    costoEmpaque,
    fleteUnitario,
    mermaPorcentaje: esServicio ? 0 : mermaPorcentaje,
    margenPorcentaje,
    margenMayoristaPorcentaje,
    precioBaseUSDT,
    esServicio,
    codigoSku,
    descripcion,
    proveedor,
    tipoFormulaItem,
    formulaPersonalizadaItem: tipoFormulaItem === 'formula_personalizada' ? { ...formulaPersonalizadaItem, pasos: pasosItemList } : undefined
  };

  const calculated = CostingCalculator.calculateItem(previewItem, tasas);
  const formulaDesc = CostingCalculator.getItemFormulaDescriptor(previewItem, tasas);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in text-gray-900 dark:text-white max-h-[92vh] max-h-[92dvh] overflow-y-auto touch-scroll">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0">
              {icono}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">
                {editingItem ? `Editar: ${editingItem.nombre}` : (esServicio ? 'Registrar Servicio' : 'Ingresar Rubro')}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-90"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tipo de Registro: Rubro o Servicio */}
        <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setEsServicio(false)}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              !esServicio ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <Package size={14} />
            <span>Rubro Agrícola / Producto</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEsServicio(true);
              setCategoria('Servicios y Fletes');
              setIcono('🚚');
              setTipoEmpaque('Viaje / Servicio');
              setMermaPorcentaje(0);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              esServicio ? 'bg-amber-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <Truck size={14} />
            <span>Servicio / Flete / Mano de Obra</span>
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            const saved: ItemCosteo = {
              id: editingItem?.id || `cost-${Date.now()}`,
              nombre: nombre.trim() || (esServicio ? 'Servicio / Actividad' : 'Rubro'),
              categoria,
              icono,
              tipoEmpaque,
              pesoEmpaqueKg: esServicio ? (pesoEmpaqueKg || 1) : Math.max(0.1, pesoEmpaqueKg),
              monedaCosto,
              tipoTasaCosto,
              tasaCompraPersonalizada: tipoTasaCosto === 'personalizada' ? tasaCompraPersonalizada : undefined,
              costoEmpaque,
              fleteUnitario: esServicio ? 0 : fleteUnitario,
              mermaPorcentaje: esServicio ? 0 : mermaPorcentaje,
              margenPorcentaje,
              margenMayoristaPorcentaje,
              precioBaseUSDT,
              tipoFormulaItem,
              formulaPersonalizadaItem: tipoFormulaItem === 'formula_personalizada' ? { ...formulaPersonalizadaItem, pasos: pasosItemList } : undefined,
              esServicio,
              codigoSku: codigoSku.trim() || undefined,
              descripcion: descripcion.trim() || undefined,
              proveedor: proveedor.trim() || undefined,
              fechaActualizacion: new Date().toLocaleDateString('es-VE')
            };
            hapticFeedback('success');
            onSaveItem(saved);
            onClose();
          }}
          className="flex flex-col gap-3.5 text-xs sm:text-sm"
        >
          {/* Selector de Ícono */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase">Ícono representativo:</span>
              <input
                type="text"
                maxLength={4}
                value={customEmojiInput}
                onChange={e => {
                  setCustomEmojiInput(e.target.value);
                  if (e.target.value.trim()) setIcono(e.target.value.trim());
                }}
                placeholder="Otro emoji..."
                className="bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs w-28 text-center outline-none"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {EXTENDED_ICONS.map(ic => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcono(ic)}
                  className={`text-xl p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    icono === ic
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 shadow-xs scale-110'
                      : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200 dark:border-slate-800 hover:border-gray-300'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del Rubro */}
          <div>
            <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">
              {esServicio ? 'Nombre del Servicio o Actividad *' : 'Nombre del Rubro o Producto *'}
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={e => handleNameChange(e.target.value)}
              placeholder={esServicio ? "Ej. Flete La Grita, Mano de Obra, Calibrado..." : "Ej. Papa Amarilla, Tomate Manzano..."}
              className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
            />
          </div>

          {/* Categoría y Empaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700 dark:text-slate-200">Categoría</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isCreatingCategory ? 'Cancelar' : '+ Nueva Categoría'}
                </button>
              </div>

              {isCreatingCategory ? (
                <div className="flex gap-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Nombre nueva categoría..."
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-blue-400 rounded-xl p-2 text-xs font-bold outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomCategory}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Crear
                  </button>
                </div>
              ) : (
                <select
                  value={categoria}
                  onChange={e => setCategoria(e.target.value as CategoriaRubro)}
                  className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px] cursor-pointer"
                >
                  {combinedCategories.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.icono} {cat.nombre}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-gray-700 dark:text-slate-200">{esServicio ? 'Unidad de Medida' : 'Presentación / Empaque'}</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingEmpaque(!isCreatingEmpaque)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isCreatingEmpaque ? 'Cancelar' : '+ Otro'}
                </button>
              </div>

              {isCreatingEmpaque ? (
                <div className="flex gap-1.5 animate-fade-in">
                  <input
                    type="text"
                    value={newEmpaqueName}
                    onChange={e => setNewEmpaqueName(e.target.value)}
                    placeholder="Ej. Guacal, Tonelada..."
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-blue-400 rounded-xl p-2 text-xs font-bold outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomEmpaque}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Añadir
                  </button>
                </div>
              ) : (
                <select
                  value={tipoEmpaque}
                  onChange={e => {
                    const val = e.target.value;
                    setTipoEmpaque(val);
                    if (val === 'Saco') setPesoEmpaqueKg(45);
                    if (val === 'Cesta') setPesoEmpaqueKg(22);
                    if (val === 'Caja') setPesoEmpaqueKg(18);
                    if (val === 'Bulto') setPesoEmpaqueKg(30);
                    if (val === 'Kilo Directo') setPesoEmpaqueKg(1);
                  }}
                  className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px] cursor-pointer"
                >
                  {DEFAULT_EMPAQUES.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                  {!DEFAULT_EMPAQUES.includes(tipoEmpaque) && <option value={tipoEmpaque}>{tipoEmpaque}</option>}
                </select>
              )}
            </div>
          </div>

          {/* Peso y Merma */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">{esServicio ? 'Cantidad Base' : 'Peso del Bulto (Kg) *'}</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0.1"
                required
                value={pesoEmpaqueKg}
                onChange={e => setPesoEmpaqueKg(parseLocaleNumber(e.target.value, 1))}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-black text-gray-900 dark:text-white text-center outline-none focus:border-blue-500 min-h-[44px]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">{esServicio ? 'Merma (N/A)' : 'Merma / Pérdida (%)'}</label>
              <input
                type="number"
                inputMode="decimal"
                step="1"
                min="0"
                max="50"
                disabled={esServicio}
                value={esServicio ? 0 : mermaPorcentaje}
                onChange={e => setMermaPorcentaje(parseLocaleNumber(e.target.value, 0))}
                placeholder="5%"
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-amber-600 dark:text-amber-400 text-center outline-none focus:border-blue-500 min-h-[44px] disabled:opacity-50"
              />
            </div>
          </div>

          {/* ─── SECCIÓN DE COSTO & MONEDA DE COMPRA MULTI-TASA ─── */}
          <div className="bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-200 uppercase">
                {esServicio ? 'Costo Base o Tarifa' : 'Moneda y Costo de Compra'}
              </span>
              <div className="flex bg-white dark:bg-[#0f172a] p-0.5 rounded-lg border border-gray-300 dark:border-slate-700">
                {(['COP', 'USD', 'VES'] as MonedaCosto[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMonedaCosto(m);
                      if (m === 'COP' && costoEmpaque < 500) setCostoEmpaque(90000);
                      if (m === 'USD' && costoEmpaque > 1000) setCostoEmpaque(25);
                      if (m === 'VES' && costoEmpaque > 5000) setCostoEmpaque(1500);
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      monedaCosto === m ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {m === 'COP' ? '🇨🇴 COP' : m === 'USD' ? '🇺🇸 USD' : '🇻🇪 Bs'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Tasa para Compras en USD o VES */}
            {monedaCosto !== 'COP' && (
              <div className="bg-white dark:bg-[#0f172a] p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col gap-1.5 animate-fade-in">
                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase">
                  Tasa de Cambio Aplicada a esta Compra:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTipoTasaCosto('bcv')}
                    className={`p-1.5 rounded-lg border text-xs font-bold text-left transition-all ${
                      tipoTasaCosto === 'bcv' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">🇻🇪 BCV</div>
                    <div>{tasas.tasaBCV.toFixed(2)} Bs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoTasaCosto('paralelo')}
                    className={`p-1.5 rounded-lg border text-xs font-bold text-left transition-all ${
                      tipoTasaCosto === 'paralelo' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">📈 Paralelo</div>
                    <div>{(tasas.tasaParalelo || 95).toFixed(2)} Bs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoTasaCosto('proveedor')}
                    className={`p-1.5 rounded-lg border text-xs font-bold text-left transition-all ${
                      tipoTasaCosto === 'proveedor' ? 'bg-amber-600 text-white border-amber-500' : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">🤝 Proveedor</div>
                    <div>{(tasas.tasaProveedor || 92).toFixed(2)} Bs</div>
                  </button>

                  {customRatesList.map(cr => (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => setTipoTasaCosto(cr.id)}
                      className={`p-1.5 rounded-lg border text-xs font-bold text-left transition-all truncate ${
                        tipoTasaCosto === cr.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200'
                      }`}
                    >
                      <div className="text-[10px] opacity-80 truncate">{cr.icono || '💵'} {cr.nombre}</div>
                      <div>{cr.valor} Bs</div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setTipoTasaCosto('personalizada')}
                    className={`p-1.5 rounded-lg border text-xs font-bold text-left transition-all ${
                      tipoTasaCosto === 'personalizada' ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-50 dark:bg-[#131b2e] border-gray-200'
                    }`}
                  >
                    <div className="text-[10px] opacity-80">✍️ Pactada</div>
                    <div>Manual</div>
                  </button>
                </div>

                {tipoTasaCosto === 'personalizada' && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Tasa Manual para este lote:</span>
                    <input
                      type="number"
                      step="0.5"
                      value={tasaCompraPersonalizada}
                      onChange={e => setTasaCompraPersonalizada(parseLocaleNumber(e.target.value, tasas.tasaBCV))}
                      className="w-28 bg-gray-50 dark:bg-[#131b2e] border border-purple-300 dark:border-purple-700 rounded-lg p-1.5 font-black text-xs text-center outline-none"
                    />
                    <span className="text-xs text-gray-500">Bs/$</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">
                  Costo ({monedaCosto}) *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step={monedaCosto === 'COP' ? '1000' : '0.1'}
                  min="0.01"
                  required
                  value={costoEmpaque}
                  onChange={e => setCostoEmpaque(parseLocaleNumber(e.target.value, 0))}
                  className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-black text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">
                  {esServicio ? 'Gasto Adicional ($ USD)' : 'Flete por Bulto ($ USD)'}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  min="0"
                  value={fleteUnitario}
                  onChange={e => setFleteUnitario(parseLocaleNumber(e.target.value, 0))}
                  placeholder="0.50"
                  className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Margen y Precio Base CSV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-purple-700 dark:text-purple-300 mb-1 block">
                Precio Base CSV (USDT)
              </label>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-1.5 min-h-[44px]">
                <span className="text-xs font-bold text-gray-400 pl-2">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.10"
                  min="0.10"
                  value={precioBaseUSDT}
                  onChange={e => setPrecioBaseUSDT(parseLocaleNumber(e.target.value, 1))}
                  className="w-full bg-transparent font-black text-purple-900 dark:text-purple-200 text-center outline-none"
                />
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 pr-2">USDT</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 block">Margen Detal (% Deseado)</label>
              <input
                type="number"
                inputMode="decimal"
                step="5"
                min="0"
                value={margenPorcentaje}
                onChange={e => setMargenPorcentaje(parseLocaleNumber(e.target.value, 0))}
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-black text-emerald-600 dark:text-emerald-400 text-center outline-none focus:border-blue-500 min-h-[44px]"
              />
            </div>
          </div>

          {/* ─── FÓRMULA MATEMÁTICA POR RUBRO ─── */}
          <div className="bg-purple-50/50 dark:bg-[#131b2e] border border-purple-200 dark:border-purple-900/60 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-300">
                  <Calculator size={15} />
                </span>
                <div>
                  <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider block">Fórmula Matemática</span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">{tipoFormulaItem === 'heredar_global' ? 'Usando la fórmula global' : 'Fórmula exclusiva'}</span>
                </div>
              </div>
              <div className="flex bg-white dark:bg-[#0f172a] p-1 rounded-xl border border-purple-200 dark:border-purple-800">
                <button
                  type="button"
                  onClick={() => setTipoFormulaItem('heredar_global')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${tipoFormulaItem === 'heredar_global' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'}`}
                >
                  🌐 Global
                </button>
                <button
                  type="button"
                  onClick={() => { if (tipoFormulaItem === 'heredar_global') setTipoFormulaItem('formula_personalizada'); }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${tipoFormulaItem !== 'heredar_global' ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'}`}
                >
                  <Wrench size={12} /> <span>🛠️ Propia</span>
                </button>
              </div>
            </div>

            {tipoFormulaItem !== 'heredar_global' && (
              <div className="flex flex-col gap-3 pt-2 border-t border-purple-100 dark:border-purple-900/40 animate-fade-in">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400 block mb-1">Estrategia aplicada a este rubro:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTipoFormulaItem('formula_personalizada')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col gap-0.5 text-left ${tipoFormulaItem === 'formula_personalizada' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white dark:bg-[#0f172a] border-gray-200'}`}
                    >
                      <span className="flex items-center gap-1"><Layers size={13} /> <span>Personalizada</span></span>
                      <span className="text-[10px] opacity-80">Constructor libre</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoFormulaItem('formula_feria_3factores')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col gap-0.5 text-left ${tipoFormulaItem === 'formula_feria_3factores' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white dark:bg-[#0f172a] border-gray-200'}`}
                    >
                      <span>🌟 3 Factores</span>
                      <span className="text-[10px] opacity-80">3150/880/765</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoFormulaItem('margen_porcentaje')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col gap-0.5 text-left ${tipoFormulaItem === 'margen_porcentaje' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white dark:bg-[#0f172a] border-gray-200'}`}
                    >
                      <span>📈 Margen %</span>
                      <span className="text-[10px] opacity-80">Directo al costo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoFormulaItem('formula_csv_usdt')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col gap-0.5 text-left ${tipoFormulaItem === 'formula_csv_usdt' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white dark:bg-[#0f172a] border-gray-200'}`}
                    >
                      <span>📊 Matriz CSV</span>
                      <span className="text-[10px] opacity-80">Precio USDT</span>
                    </button>
                  </div>
                </div>

                {tipoFormulaItem === 'formula_personalizada' && (
                  <div className="bg-white dark:bg-[#0f172a] p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400">Plantillas:</span>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setFormulaPersonalizadaItem({
                            variableEntrada: 'costo_origen_kilo',
                            monedaResultado: 'VES',
                            pasos: [
                              { id: 'p-1', nombre: 'Paso 1: Margen', op: 'percent_add', val: 35, tipoValor: 'manual', activo: true }
                            ]
                          });
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      >
                        🌐 Origen + 35%
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormulaPersonalizadaItem({
                            variableEntrada: 'costo_origen_kilo',
                            monedaResultado: 'USD',
                            pasos: [
                              { id: 'p-1', nombre: 'Paso 1: Divisor COP', op: 'div', val: tasas.tasaCompraCOP_USDT || 3.2, tipoValor: 'divisor_cop_usdt', activo: true },
                              { id: 'p-2', nombre: 'Paso 2: Tasa BCV', op: 'div', val: tasas.tasaBCV, tipoValor: 'tasa_bcv', activo: true }
                            ]
                          });
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      >
                        🌟 Feria (COP ÷ 3.2 ÷ Kilos ÷ BCV = $ USD)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormulaPersonalizadaItem({
                            variableEntrada: 'costo_kilo_ves',
                            monedaResultado: 'VES',
                            pasos: [
                              { id: 'p-1', nombre: 'Paso 1: Margen Local', op: 'percent_add', val: 30, tipoValor: 'manual', activo: true }
                            ]
                          });
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        🇻🇪 Bs + 30%
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Variable de Inicio:</label>
                        <select
                          value={formulaPersonalizadaItem.variableEntrada || 'costo_origen_empaque'}
                          onChange={e => handleUpdateFormulaPersonalizadaItem({ variableEntrada: e.target.value as VariableEntradaFormula })}
                          className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-1.5 text-xs font-bold"
                        >
                          <optgroup label="🔄 Universal Inteligente">
                            <option value="costo_origen_empaque">🔄 [Costo Origen Bulto]</option>
                            <option value="costo_origen_kilo">🔄 [Costo Origen Kilo]</option>
                          </optgroup>
                          <optgroup label="🇨🇴 Pesos Colombianos (COP)">
                            <option value="costo_bulto_cop">🇨🇴 [Costo Bulto COP]</option>
                            <option value="costo_kilo_cop">🇨🇴 [Costo Kilo COP]</option>
                          </optgroup>
                          <optgroup label="🇻🇪 Bolívares (VES)">
                            <option value="costo_bulto_ves">🇻🇪 [Costo Bulto Bs. VES]</option>
                            <option value="costo_kilo_ves">🇻🇪 [Costo Kilo Bs. VES]</option>
                          </optgroup>
                          <optgroup label="🇺🇸 Dólares Base / Efectivo">
                            <option value="costo_bulto_usd">🇺🇸 [Costo Bulto USD Base]</option>
                            <option value="costo_kilo_usd">🇺🇸 [Costo Kilo USD Base]</option>
                          </optgroup>
                          <optgroup label="📈 Dólares Tasas Venezuela">
                            <option value="costo_bulto_usd_bcv">🇻🇪 [Costo USD @ BCV]</option>
                            <option value="costo_bulto_usd_paralelo">📈 [Costo USD @ Paralelo]</option>
                            <option value="costo_bulto_usd_proveedor">🤝 [Costo USD @ Proveedor]</option>
                          </optgroup>
                          <optgroup label="📊 Matriz CSV">
                            <option value="precio_base_usdt">📊 [Precio Base CSV USDT]</option>
                          </optgroup>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Moneda de Salida:</label>
                        <select
                          value={formulaPersonalizadaItem.monedaResultado || 'VES'}
                          onChange={e => handleUpdateFormulaPersonalizadaItem({ monedaResultado: e.target.value as MonedaSalidaFormula })}
                          className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-lg p-1.5 text-xs font-bold"
                        >
                          <option value="VES">🇻🇪 Bolívares (Bs. BCV)</option>
                          <option value="USD">🇺🇸 Dólares ($ USD)</option>
                          <option value="COP">🇨🇴 Pesos Colombianos (COP)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase">Pasos Encadenados ({pasosItemList.length}):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pasosItemList.map((p, idx) => {
                          const resStep = CostingCalculator.resolveStepValue(p, tasas);
                          return (
                            <div key={p.id} className="p-2.5 bg-gray-50 dark:bg-[#131b2e] border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase">Paso {idx + 1}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdatePasoItem(p.id, { activo: !p.activo })}
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${p.activo ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-200 text-gray-600'}`}
                                  >
                                    {p.activo ? 'On' : 'Off'}
                                  </button>
                                  {pasosItemList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePasoItem(p.id)}
                                      className="text-gray-400 hover:text-red-500 p-0.5"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <select
                                value={p.tipoValor || 'manual'}
                                onChange={e => handleUpdatePasoItem(p.id, { tipoValor: e.target.value as TipoValorPaso })}
                                className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded p-1 text-[10px] font-bold"
                              >
                                <option value="manual">🔢 Número Libre</option>
                                <option value="tasa_bcv">🇻🇪 Tasa BCV ({tasas.tasaBCV.toFixed(2)})</option>
                                <option value="tasa_paralelo">📈 Tasa Paralelo ({(tasas.tasaParalelo || 95).toFixed(2)})</option>
                                <option value="tasa_proveedor">🤝 Tasa Proveedor ({(tasas.tasaProveedor || 92).toFixed(2)})</option>
                                <option value="divisor_cop_usdt">🔢 Divisor CSV ({tasas.tasaCompraCOP_USDT || 3150})</option>
                                <option value="factor_margen">📐 Factor Margen ({tasas.factorMargenCOP || 880})</option>
                                <option value="tasa_divisa_bcv">🏛️ Divisa Feria ({tasas.tasaDivisaBCV || 765})</option>
                                {customRatesList.map(cr => (
                                  <option key={cr.id} value={cr.id}>
                                    {cr.icono || '💵'} {cr.nombre} ({cr.valor})
                                  </option>
                                ))}
                              </select>

                              <div className="grid grid-cols-2 gap-1">
                                <select
                                  value={p.op}
                                  onChange={e => handleUpdatePasoItem(p.id, { op: e.target.value as OperadorPasoFormula })}
                                  className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded p-1 text-[11px] font-bold"
                                >
                                  <option value="div">÷ Divide</option>
                                  <option value="mul">× Mult.</option>
                                  <option value="add">+ Suma</option>
                                  <option value="sub">- Resta</option>
                                  <option value="percent_add">+% Margen</option>
                                  <option value="percent_sub">-% Desc.</option>
                                  <option value="none">⚪ Omitir</option>
                                </select>

                                {p.tipoValor && p.tipoValor !== 'manual' ? (
                                  <div className="bg-purple-100 dark:bg-purple-950/60 rounded p-1 text-[10px] font-black text-center truncate flex items-center justify-center">
                                    {resStep.label}
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    value={p.val === 0 ? '0' : p.val}
                                    onChange={e => handleUpdatePasoItem(p.id, { val: parseLocaleNumber(e.target.value, 0) })}
                                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-300 dark:border-slate-700 rounded p-1 text-[11px] font-black text-center"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleAddPasoItem}
                        className="py-1.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-dashed border-purple-300 dark:border-purple-800 rounded-lg text-xs font-bold"
                      >
                        + Agregar Paso
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── PREVIEW EN VIVO DEL CÁLCULO ─── */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-[#131b2e] dark:to-slate-900 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                Simulación en Tiempo Real
              </span>
              <span className="text-[11px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-md shadow-xs">
                {formulaDesc.titulo}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 dark:bg-[#0f172a]/80 p-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span className="text-[10px] text-gray-500 block">Costo Kilo USD</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">${calculated.costoKiloUSD.toFixed(2)}</span>
              </div>
              <div className="bg-white/80 dark:bg-[#0f172a]/80 p-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span className="text-[10px] text-gray-500 block">Venta Detal USD</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">${calculated.precioVentaDetalKiloUSD.toFixed(2)}</span>
              </div>
              <div className="bg-white/80 dark:bg-[#0f172a]/80 p-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span className="text-[10px] text-gray-500 block">Precio BCV (Bs/Kg)</span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">{CostingCalculator.formatVES(calculated.precioVentaDetalKiloVES)}</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 dark:text-slate-400 font-mono truncate">
              {formulaDesc.notacion}
            </div>
          </div>

          {/* Opciones Avanzadas: Proveedor y SKU */}
          <div className="border-t border-gray-200 dark:border-slate-800 pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showAdvanced ? 'Ocultar datos adicionales' : 'Ver datos adicionales (Proveedor, Código, Notas)'}</span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-fade-in">
                <div>
                  <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Proveedor / Origen</label>
                  <input
                    type="text"
                    value={proveedor}
                    onChange={e => setProveedor(e.target.value)}
                    placeholder="Ej. Distribuidora Cúcuta, Finca La Grita..."
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Código / SKU</label>
                  <input
                    type="text"
                    value={codigoSku}
                    onChange={e => setCodigoSku(e.target.value)}
                    placeholder="Ej. PAP-01"
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2 font-bold text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Notas / Descripción</label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Observaciones de calidad, calibre o entrega..."
                    className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2 font-bold text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-slate-800">
            {editingItem && onDeleteItem ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar "${editingItem.nombre}" de la hoja de costeo?`)) {
                    hapticFeedback('warning');
                    onDeleteItem(editingItem.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px] active:scale-95"
              >
                <Trash2 size={16} />
                <span>Eliminar</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer min-h-[44px] active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-transform active:scale-95 cursor-pointer min-h-[44px]"
              >
                {editingItem ? 'Guardar Cambios' : 'Registrar Saco'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
