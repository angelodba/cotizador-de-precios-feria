/**
 * TIPOS Y DEFINICIONES PARA EL MÓDULO COTIZADOR MULTIMONEDA
 * Sistema Administrativo Feria Los Cafeteros
 */

export type CotizadorUnidad = 'Kg' | 'g' | 'lb' | 'Unidad' | 'Manojo' | 'Saco' | 'Cesta' | 'Paquete';

export type CotizadorCategoria = 'hortalizas' | 'frutas' | 'tuberculos' | 'alinos' | 'viveres' | 'otros';

export interface UnitConversionDef {
  factor: number | null; // null si depende de pesoPromedioKg
  label: string;
  shortLabel: string;
  step: number;
}

export type TipoRedondeoBCV = 'exacto' | 'entero' | 'multiplo_5' | 'multiplo_10';
export type TipoRedondeoCOP = 'exacto' | 'centena' | 'quinientos' | 'mil';
export type ModoCalculoPrecio = 'formula_feria' | 'directo_usd';
export type TipoFormulaCOP = 'feria_3_factores' | 'costo_margen_porcentaje' | 'factor_directo_bcv' | 'personalizada';

export interface FormulaPersonalizadaConfig {
  op1: 'div' | 'mul';
  val1: number; // Ej. 3150
  op2: 'mul' | 'div' | 'add';
  val2: number; // Ej. 880
  op3: 'div' | 'mul';
  val3: number; // Ej. 765
}

export interface CotizadorFormulaParams {
  tipoFormulaCOP?: TipoFormulaCOP;
  tasaCompraCOP_USDT: number; // Ej. 3150
  factorMargen: number;        // Ej. 880
  tasaDivisaBCV: number;       // Ej. 765
  margenPorcentajeCOP?: number; // Ej. 25 (%)
  factorDirectoBCV?: number;    // Ej. 0.000365
  formulaPersonalizada?: FormulaPersonalizadaConfig;
  tipoRedondeoBCV: TipoRedondeoBCV;
  tipoRedondeoCOP: TipoRedondeoCOP;
  modoCalculo: ModoCalculoPrecio;
}

export type MonedaCostoOrigen = 'COP' | 'USD' | 'VES';

export interface CotizadorProduct {
  id: string;
  nombre: string;
  categoria: CotizadorCategoria;
  unidadDefecto: CotizadorUnidad;
  pesoPromedioDefectoKg: number;
  taraDefectoKg: number;
  precioBaseUSD: number; // Precio por Kg en USD (o precio ref dólar BCV)
  
  // Soporte de Costo Multimoneda de Origen
  monedaCosto?: MonedaCostoOrigen; // 'COP' | 'USD' | 'VES'
  costoOrigen?: number;            // Monto de costo en la moneda de origen
  margenPorcentaje?: number;       // Margen opcional en % (ej. 25 para 25%)
  costoBaseCOP?: number;           // Retrocompatibilidad con costo en COP

  permitePesajeBalanza: boolean;
  icono: string;
  descripcion: string;
}

export interface CotizadorQuoteItem {
  id: string;
  nombre: string;
  icono: string;
  precioBaseUSD: number;
  
  monedaCosto?: MonedaCostoOrigen;
  costoOrigen?: number;
  margenPorcentaje?: number;
  costoBaseCOP?: number;
  
  categoria: CotizadorCategoria;
  unidad: CotizadorUnidad;
  pesoPromedioDefectoKg: number;
  taraKg: number;
  cantidad: number;
  lineDiscountPercent: number;

  // Calculados
  grossKg?: number;
  netKg?: number;
  subtotalUSD?: number;
  subtotalVES?: number;
  subtotalCOP?: number;
  subtotalUSDT?: number;
  unitPrices?: {
    baseUSD: number;
    precioRefDolarBCV: number; // Precio referencial en Dólar BCV ($/Kg)
    precioBCV: number;
    precioCOP: number;
    precioUSDT: number;
  };
}

export interface CotizadorRates {
  bcv: number;
  cop: number;
  usdt: number;
  paralelo?: number;
  spreadPercent?: number;
  lastUpdated?: string;

  // Parámetros de Fórmula COP Personalizable
  tipoFormulaCOP?: TipoFormulaCOP;
  tasaCompraCOP_USDT?: number; // Ej. 3150 (Divide costo COP -> USDT)
  factorMargen?: number;        // Ej. 880 (Multiplica USDT -> COP Venta)
  tasaDivisaBCV?: number;       // Ej. 765 (Divide COP Venta -> BCV Venta)
  margenPorcentajeCOP?: number; // Ej. 25 (%) para modo margen tradicional
  factorDirectoBCV?: number;    // Ej. 0.000365 para modo directo a Bs
  formulaPersonalizada?: FormulaPersonalizadaConfig;

  tipoRedondeoBCV?: TipoRedondeoBCV;
  tipoRedondeoCOP?: TipoRedondeoCOP;
  modoCalculo?: ModoCalculoPrecio;
}

export interface CotizadorTotals {
  items: CotizadorQuoteItem[];
  rawTotals: {
    totalUSD: number;
    totalVES: number;
    totalCOP: number;
    totalUSDT: number;
  };
  discountPercent: number;
  discountAmountUSD: number;
  finalTotals: {
    totalUSD: number;
    totalVES: number;
    totalBCV: number;
    totalCOP: number;
    totalUSDT: number;
    totalGrossKg: number;
    totalNetKg: number;
    totalKilos: number;
    totalItemsCount: number;
  };
}

export interface SplitPaymentsInput {
  usdCash: number;
  zelleUSD: number;
  usdtCash: number;
  bcvPagoMovil: number;
  copCash: number;
}

export interface SplitPaymentsResult {
  totalDueUSD: number;
  totalPaidUSD: number;
  breakdown: {
    usdCash: number;
    zelleUSD: number;
    usdtCash: number;
    usdFromUSDT: number;
    bcvPagoMovil: number;
    usdFromBCV: number;
    copCash: number;
    usdFromCOP: number;
  };
  isExactPayment: boolean;
  isFullyPaid: boolean;
  remainingUSD: number;
  remainingVES: number;
  remainingBCV: number;
  remainingCOP: number;
  remainingUSDT: number;
  changeUSD: number;
  changeBCV: number;
  changeVES: number;
  changeCOP: number;
}

export interface CotizadorProps {
  systemTasas?: { tasaBCV: number; tasaCOP: number };
  onUpdateSystemTasas?: (tasas: { tasaBCV: number; tasaCOP: number }) => void;
  onRegisterSale?: (totalUSD: number, paymentMethod?: 'Pagomovil' | 'Cash USD' | 'Cash VES' | 'Punto de Venta') => void;
  easyMode?: boolean;
  highContrast?: boolean;
}
