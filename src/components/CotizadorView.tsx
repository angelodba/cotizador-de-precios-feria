import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CotizadorProps,
  CotizadorRates,
  CotizadorProduct,
  CotizadorQuoteItem,
  CotizadorCategoria,
  MonedaCostoOrigen,
  SplitPaymentsInput
} from '../types/cotizador';
import { INITIAL_COTIZADOR_PRODUCTS, DEFAULT_FORMULA_FERIA } from '../utils/cotizadorData';
import {
  CotizadorCalculator
} from '../utils/cotizadorCalculator';

// Componentes Modulares Limpios
import { CatalogSection } from './catalog/CatalogSection';
import { QuotationSection } from './quotation/QuotationSection';
import { ProductModal } from './modals/ProductModal';
import { SplitPaymentModal } from './modals/SplitPaymentModal';
import { ToastNotification } from './common/ToastNotification';
import { MobileFloatingBar } from './common/MobileFloatingBar';

const QUICK_WEIGHT_PRESETS = [
  { label: '+0.5k', value: 0.5 },
  { label: '+1k',   value: 1.0 },
  { label: '+2k',   value: 2.0 },
  { label: '+5k',   value: 5.0 },
];

export const CotizadorView: React.FC<CotizadorProps> = ({
  systemTasas,
  onRegisterSale,
  highContrast = false
}) => {
  // ─── 1. GESTIÓN DE TASAS & PERSISTENCIA ──────────────────────────────
  const rates = useMemo<CotizadorRates>(() => {
    const defaultRates: CotizadorRates = {
      bcv: Number(systemTasas?.tasaBCV || 76.50),
      cop: Number(systemTasas?.tasaCOP || 3850),
      usdt: 1.00,
      paralelo: Number(systemTasas?.tasaBCV || 76.50),
      lastUpdated: new Date().toISOString(),
      ...(DEFAULT_FORMULA_FERIA as Partial<CotizadorRates>)
    };

    try {
      const saved = localStorage.getItem('feria_cotizador_rates');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultRates,
          ...parsed,
          bcv: Number(systemTasas?.tasaBCV || parsed?.bcv || 76.50),
          cop: Number(systemTasas?.tasaCOP || parsed?.cop || 3850),
          usdt: Number(parsed?.usdt || 1.00),
          paralelo: Number(parsed?.paralelo || systemTasas?.tasaBCV || parsed?.bcv || 76.50)
        };
      }
    } catch {}

    return defaultRates;
  }, [systemTasas]);

  // ─── 2. GESTIÓN DEL CATÁLOGO DE RUBROS & PERSISTENCIA ────────────────
  const [products, setProducts] = useState<CotizadorProduct[]>(() => {
    try {
      const saved = localStorage.getItem('feria_cotizador_products');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COTIZADOR_PRODUCTS;
  });

  // ─── 3. ÍTEMS EN COTIZACIÓN ACTIVA ──────────────────────────────────
  const [quoteItems, setQuoteItems] = useState<CotizadorQuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('feria_cotizador_quote_items');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // ─── 4. ESTADOS DE FILTROS, DESCUENTOS Y UI ──────────────────────────
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CotizadorCategoria | 'todas'>('todas');
  const [mobileTab, setMobileTab] = useState<'catalogo' | 'cotizacion' | 'ambos'>('ambos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<CotizadorProduct | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Estados del Modal de Edición de Producto
  const [modalMoneda, setModalMoneda] = useState<MonedaCostoOrigen>('COP');
  const [modalCosto, setModalCosto] = useState<number>(90000);
  const [modalMargen, setModalMargen] = useState<number>(25);
  const [modalDirectUSD, setModalDirectUSD] = useState<number>(1.20);

  // Estado del Modal de Pago Mixto
  const [payments, setPayments] = useState<SplitPaymentsInput>({
    usdCash: 0,
    zelleUSD: 0,
    usdtCash: 0,
    bcvPagoMovil: 0,
    copCash: 0
  });

  // ─── 5. INSTANCIA MEMOIZADA DEL MOTOR DE CÁLCULO ────────────────────
  const calculator = useMemo(() => new CotizadorCalculator(rates), [rates]);

  // Totales consolidados de la cotización
  const quotationData = useMemo(() => {
    return calculator.calculateQuotationTotals(quoteItems, globalDiscount);
  }, [calculator, quoteItems, globalDiscount]);

  // Resultado de pago mixto
  const paymentResult = useMemo(() => {
    return calculator.calculateMixedPayment(quotationData.finalTotals.totalUSD, payments);
  }, [calculator, quotationData.finalTotals.totalUSD, payments]);

  // ─── 6. EFECTOS DE PERSISTENCIA Y SINCRONIZACIÓN ─────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('feria_cotizador_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('feria_cotizador_quote_items', JSON.stringify(quoteItems));
    } catch {}
  }, [quoteItems]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // ─── 7. MANEJADORES DE COTIZACIÓN ────────────────────────────────────
  const handleAddProduct = useCallback((product: CotizadorProduct, amount?: number) => {
    const defaultQty = amount || product.pesoPromedioDefectoKg || 1;
    const defaultTare = product.taraDefectoKg || 0;

    setQuoteItems(prev => {
      const existingIdx = prev.findIndex(item => item.id === product.id && item.unidad === product.unidadDefecto);

      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentItem = updated[existingIdx];
        const newQty = currentItem.cantidad + defaultQty;
        
        const rawItem: CotizadorQuoteItem = {
          ...currentItem,
          cantidad: newQty
        };
        updated[existingIdx] = calculator.calculateItemTotals(rawItem);
        return updated;
      }

      const rawItem: CotizadorQuoteItem = {
        id: product.id,
        nombre: product.nombre,
        categoria: product.categoria,
        icono: product.icono,
        precioBaseUSD: product.precioBaseUSD,
        monedaCosto: product.monedaCosto,
        costoOrigen: product.costoOrigen,
        margenPorcentaje: product.margenPorcentaje,
        costoBaseCOP: product.costoBaseCOP,
        cantidad: defaultQty,
        unidad: product.unidadDefecto,
        pesoPromedioDefectoKg: product.pesoPromedioDefectoKg,
        taraKg: defaultTare,
        lineDiscountPercent: 0
      };

      const newItem = calculator.calculateItemTotals(rawItem);
      return [newItem, ...prev];
    });

    showToast(`🛒 ${product.nombre} (+${defaultQty} ${product.unidadDefecto})`);
  }, [calculator, showToast]);

  const handleUpdateQuoteItem = useCallback((index: number, updates: Partial<CotizadorQuoteItem>) => {
    setQuoteItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      if (!item) return prev;

      const mergedItem: CotizadorQuoteItem = {
        ...item,
        ...updates
      };

      updated[index] = calculator.calculateItemTotals(mergedItem);
      return updated;
    });
  }, [calculator]);

  const handleIncrementQuoteItem = useCallback((index: number, delta: number) => {
    const item = quoteItems[index];
    if (!item) return;
    const newQty = Math.max(0.001, parseFloat((item.cantidad + delta).toFixed(3)));
    handleUpdateQuoteItem(index, { cantidad: newQty });
  }, [quoteItems, handleUpdateQuoteItem]);

  const handleRemoveQuoteItem = useCallback((index: number) => {
    const item = quoteItems[index];
    setQuoteItems(prev => prev.filter((_, i) => i !== index));
    if (item) showToast(`🗑️ ${item.nombre} eliminado.`);
  }, [quoteItems, showToast]);

  const handleClearQuote = useCallback(() => {
    if (quoteItems.length === 0) return;
    if (window.confirm('¿Vaciar todos los rubros de la cotización?')) {
      setQuoteItems([]);
      setGlobalDiscount(0);
      showToast('🧹 Cotización vaciada.');
    }
  }, [quoteItems.length, showToast]);

  // ─── 8. EDICIÓN & CREACIÓN DE PRODUCTOS ──────────────────────────────
  const handleOpenCreateProductModal = () => {
    setEditingProduct(null);
    setModalMoneda('COP');
    setModalCosto(90000);
    setModalMargen(25);
    setModalDirectUSD(1.20);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (product: CotizadorProduct) => {
    setEditingProduct(product);
    setModalMoneda(product.monedaCosto || 'COP');
    setModalCosto(product.costoOrigen || product.costoBaseCOP || 90000);
    setModalMargen(product.margenPorcentaje ?? 25);
    setModalDirectUSD(product.precioBaseUSD || 1.20);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (product: CotizadorProduct, isEditing: boolean) => {
    if (isEditing) {
      setProducts(prev => prev.map(p => (p.id === product.id ? product : p)));
      showToast(`✏️ ${product.nombre} actualizado.`);
    } else {
      setProducts(prev => [product, ...prev]);
      showToast(`➕ ${product.nombre} añadido al catálogo.`);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setQuoteItems(prev => prev.filter(item => item.id !== productId));
    setIsProductModalOpen(false);
    showToast('🗑️ Rubro eliminado del catálogo.');
  };

  // ─── 9. ACCIONES COMERCIALES (WHATSAPP & TICKET) ──────────────────────
  const handleShareWhatsApp = useCallback(() => {
    if (quoteItems.length === 0) return;

    let text = `*COTIZACIÓN — FERIA LOS CAFETEROS*\n`;
    text += `📅 Fecha: ${new Date().toLocaleDateString('es-VE')} ${new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}\n`;
    text += `🇻🇪 *Tasa Oficial BCV:* ${rates.bcv} Bs/$\n`;
    text += `------------------------------------\n`;

    quoteItems.forEach((item, i) => {
      text += `${i + 1}. *${item.icono || '🥬'} ${item.nombre}*\n`;
      text += `   • Cantidad: ${item.cantidad} ${item.unidad}`;
      if ((item.taraKg || 0) > 0) {
        text += ` (Tara: ${item.taraKg} Kg ➔ Neto: ${CotizadorCalculator.formatWeight(item.netKg || 0, true)})`;
      }
      text += `\n`;
      text += `   • Subtotal: *${CotizadorCalculator.formatBCV(item.subtotalVES || 0)}* (${CotizadorCalculator.formatUSD(item.subtotalUSD || 0)})\n`;
    });

    text += `------------------------------------\n`;
    if (globalDiscount > 0) {
      text += `🎁 Descuento (${globalDiscount}%): -${CotizadorCalculator.formatUSD(quotationData.discountAmountUSD)}\n`;
    }
    text += `⚖️ *Peso Total Neto:* ${CotizadorCalculator.formatWeight(quotationData.finalTotals.totalNetKg, true)}\n`;
    text += `💰 *TOTAL BOLÍVARES (BCV):* *${CotizadorCalculator.formatBCV(quotationData.finalTotals.totalVES)}*\n`;
    text += `💵 *TOTAL DÓLARES ($):* *${CotizadorCalculator.formatUSD(quotationData.finalTotals.totalUSD)}*\n`;
    text += `------------------------------------\n`;
    text += `_¡Gracias por su preferencia!_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }, [quoteItems, rates.bcv, globalDiscount, quotationData]);

  const handlePrintTicket = useCallback(() => {
    window.print();
  }, []);

  // Filtrado reactivo de productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCat = selectedCategory === 'todas' || product.categoria === selectedCategory;
      const matchesSearch = !searchQuery.trim() || product.nombre.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full gap-5">
      
      {/* ─── PESTAÑAS MÓVILES PARA CAMBIAR ENTRE CATÁLOGO Y COTIZACIÓN ─ */}
      <div className="xl:hidden flex bg-white dark:bg-[#0f172a] p-1.5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm gap-1.5">
        <button
          onClick={() => setMobileTab('catalogo')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
            mobileTab === 'catalogo' || mobileTab === 'ambos'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
          }`}
        >
          <span>🥬 Catálogo ({products.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('cotizacion')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
            mobileTab === 'cotizacion'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900'
          }`}
        >
          <span>🛒 Carrito ({quotationData.finalTotals.totalItemsCount})</span>
        </button>
      </div>

      {/* ─── CONTENEDOR PRINCIPAL LIMPIO EN 2 COLUMNAS (ESPACIOSO Y MINIMALISTA) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Catálogo de Rubros */}
        <CatalogSection
          products={products}
          filteredProducts={filteredProducts}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSelectCategory={setSelectedCategory}
          onSearchChange={setSearchQuery}
          onResetDefaults={() => {
            if (window.confirm('¿Restaurar catálogo inicial con precios por defecto?')) {
              setProducts(INITIAL_COTIZADOR_PRODUCTS);
              showToast('🔄 Catálogo restaurado.');
            }
          }}
          onOpenCreateModal={handleOpenCreateProductModal}
          calculator={calculator}
          quickPresets={QUICK_WEIGHT_PRESETS}
          onAddProduct={handleAddProduct}
          onEditProduct={handleOpenEditProductModal}
          highContrast={highContrast}
          mobileTab={mobileTab}
        />

        {/* Columna Derecha: Cotización y Totales */}
        <QuotationSection
          quotationData={quotationData}
          rates={rates}
          globalDiscount={globalDiscount}
          onDiscountChange={setGlobalDiscount}
          onUpdateItem={handleUpdateQuoteItem}
          onIncrementItem={handleIncrementQuoteItem}
          onRemoveItem={handleRemoveQuoteItem}
          onClearQuote={handleClearQuote}
          onOpenPaymentModal={() => {
            setPayments({
              usdCash: 0,
              zelleUSD: 0,
              usdtCash: 0,
              bcvPagoMovil: quotationData.finalTotals.totalVES,
              copCash: 0
            });
            setIsPaymentModalOpen(true);
          }}
          onShareWhatsApp={handleShareWhatsApp}
          onPrint={handlePrintTicket}
          onRegisterSale={onRegisterSale}
          onShowToast={showToast}
          highContrast={highContrast}
          mobileTab={mobileTab}
        />
      </div>

      {/* ─── MODAL DE AGREGAR / EDITAR RUBRO ─────────────────────────── */}
      <ProductModal
        isOpen={isProductModalOpen}
        editingProduct={editingProduct}
        rates={rates}
        modalMoneda={modalMoneda}
        modalCosto={modalCosto}
        modalMargen={modalMargen}
        modalDirectUSD={modalDirectUSD}
        onModalMonedaChange={setModalMoneda}
        onModalCostoChange={setModalCosto}
        onModalMargenChange={setModalMargen}
        onClose={() => setIsProductModalOpen(false)}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* ─── MODAL DE PAGO MIXTO (5 VÍAS) ───────────────────────────── */}
      <SplitPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        quotationData={quotationData}
        rates={rates}
        payments={payments}
        paymentResult={paymentResult}
        onPaymentsChange={setPayments}
        onRegisterSale={onRegisterSale}
        onShowToast={showToast}
      />

      {/* ─── NOTIFICACIÓN TOAST FLOTANTE ────────────────────────────── */}
      <ToastNotification message={toastMessage} />

      {/* ─── BARRA FLOTANTE MÓVIL (RESUMEN RÁPIDO) ──────────────────── */}
      <MobileFloatingBar
        totalItemsCount={quotationData.finalTotals.totalItemsCount}
        totalVES={quotationData.finalTotals.totalVES}
        totalUSD={quotationData.finalTotals.totalUSD}
        onOpenQuotation={() => setMobileTab('cotizacion')}
        onShareWhatsApp={handleShareWhatsApp}
      />

    </div>
  );
};

export default CotizadorView;
