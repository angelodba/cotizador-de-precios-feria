import { WEIGHT_UNIT_CONVERSIONS } from './cotizadorData';
import type {
  CotizadorUnidad,
  CotizadorQuoteItem,
  CotizadorRates,
  CotizadorTotals,
  SplitPaymentsInput,
  SplitPaymentsResult
} from '../types/cotizador';

/**
 * Redondeo seguro contra error de punto flotante IEEE 754.
 * Usa Number.EPSILON para evitar 0.1 + 0.2 = 0.30000000000000004
 */
export function roundSafe(x: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(x) + Number.EPSILON) * factor) / factor;
}

/**
 * Sanitiza un valor numérico. Devuelve fallback si es NaN, Infinito o negativo.
 * NOTA: el doble-OR `|| fallback` NO se usa aquí deliberadamente para no suprimir 0 válido.
 */
export function safeNum(val: unknown, fallback: number = 0): number {
  const n = Number(val);
  if (!isFinite(n) || isNaN(n) || n < 0) return fallback;
  return n;
}

/**
 * Sanitiza una tasa de cambio. Garantiza que la tasa sea siempre > 0.
 * Usa fallback si la tasa es 0 o inválida (previene divisiones por cero).
 */
function safeRate(val: unknown, fallback: number): number {
  const n = Number(val);
  if (!isFinite(n) || isNaN(n) || n <= 0) return fallback;
  return n;
}

/**
 * Normaliza cualquier unidad a Kilogramos brutos.
 */
export function normalizeWeightToKg(
  rawQty: number,
  unit: CotizadorUnidad = 'Kg',
  avgKgPerUnit: number = 1.0
): number {
  const qty = safeNum(rawQty, 0);
  const unitDef = WEIGHT_UNIT_CONVERSIONS[unit];

  if (!unitDef) return qty;
  if (unitDef.factor !== null) {
    return roundSafe(qty * unitDef.factor, 6);
  }

  // factor === null → depende de pesoPromedioDefectoKg (Unidad, Manojo, Saco, Cesta, Paquete)
  const avgKg = safeNum(avgKgPerUnit, 1.0);
  return roundSafe(qty * (avgKg > 0 ? avgKg : 1.0), 6);
}

/**
 * Aplica deducción de tara para obtener peso neto en Kg.
 * Garantiza que el peso neto no sea negativo.
 */
export function applyTare(grossKg: number, taraKg: number = 0): number {
  return Math.max(0, roundSafe(grossKg - safeNum(taraKg, 0), 6));
}

/**
 * Redondeo comercial para precios en Bolívares (Bs.).
 */
export function roundCommercialBCV(val: number, tipo: string = 'entero'): number {
  const num = safeNum(val, 0);
  switch (tipo) {
    case 'exacto':
      return roundSafe(num, 2);
    case 'multiplo_5':
      return Math.round(num / 5) * 5;
    case 'multiplo_10':
      return Math.round(num / 10) * 10;
    case 'entero':
    default:
      return Math.round(num);
  }
}

/**
 * Redondeo comercial para precios en Pesos Colombianos (COP).
 */
export function roundCommercialCOP(val: number, tipo: string = 'centena'): number {
  const num = safeNum(val, 0);
  switch (tipo) {
    case 'exacto':
      return roundSafe(num, 0);
    case 'quinientos':
      return Math.round(num / 500) * 500;
    case 'mil':
      return Math.round(num / 1000) * 1000;
    case 'centena':
    default:
      return Math.round(num / 100) * 100;
  }
}

/**
 * Motor Dinámico de Fórmulas para Compras en COP:
 * Soporta 4 estrategias personalizables:
 *  1. 'feria_3_factores' (Por Defecto / Institucional Feria): Costo COP ÷ TasaCompra × FactorMargen ÷ TasaDivisa
 *  2. 'costo_margen_porcentaje': (Costo COP ÷ Tasa COP) × (1 + Margen % / 100)
 *  3. 'factor_directo_bcv': Costo COP × Factor Directo
 *  4. 'personalizada': Constructor libre de 3 pasos
 */
export function calculateFeriaPriceFromCost(
  costoBaseCOP: number,
  rates: Partial<CotizadorRates> = {}
) {
  const costoCOP = safeNum(costoBaseCOP, 0);
  const bcvRate = safeRate(rates.bcv, 76.50);
  const copRate = safeRate(rates.cop, 3850.00);
  const tipoFormula = rates.tipoFormulaCOP || 'feria_3_factores';

  let usdtRaw = 0;
  let copVentaRaw = 0;
  let bcvRaw = 0;
  let formulaActivaTexto = '';

  if (tipoFormula === 'costo_margen_porcentaje') {
    // Modo 2: Margen Porcentual Tradicional
    const margenPct = safeNum(rates.margenPorcentajeCOP, 25);
    const usdCosto = costoCOP > 0 && copRate > 0 ? costoCOP / copRate : 0;
    const usdFinal = usdCosto * (1 + margenPct / 100);
    
    usdtRaw = usdFinal;
    copVentaRaw = usdFinal * copRate;
    bcvRaw = usdFinal * bcvRate;
    formulaActivaTexto = `([Costo COP] ÷ ${copRate} COP/$) + ${margenPct}% margen = PRECIO FINAL BCV`;

  } else if (tipoFormula === 'factor_directo_bcv') {
    // Modo 3: Multiplicador Directo a Bolívares
    const factorDirecto = safeNum(rates.factorDirectoBCV, 0.000365);
    bcvRaw = costoCOP * factorDirecto;
    const usdFinal = bcvRate > 0 ? bcvRaw / bcvRate : 0;
    usdtRaw = usdFinal;
    copVentaRaw = usdFinal * copRate;
    formulaActivaTexto = `[Costo COP] × ${factorDirecto} = PRECIO FINAL BCV`;

  } else if (tipoFormula === 'personalizada') {
    // Modo 4: Constructor Personalizado de 3 Pasos
    const cfg = rates.formulaPersonalizada || {
      op1: 'div',
      val1: 3150,
      op2: 'mul',
      val2: 880,
      op3: 'div',
      val3: 765
    };

    const val1 = safeRate(cfg.val1, 3150);
    const val2 = safeNum(cfg.val2, 880);
    const val3 = safeRate(cfg.val3, 765);

    const step1 = cfg.op1 === 'div' ? costoCOP / val1 : costoCOP * val1;
    const step2 = cfg.op2 === 'mul' ? step1 * val2 : cfg.op2 === 'div' ? step1 / val2 : step1 + val2;
    const step3 = cfg.op3 === 'div' ? step2 / val3 : step2 * val3;

    bcvRaw = step3;
    const usdFinal = bcvRate > 0 ? bcvRaw / bcvRate : 0;
    usdtRaw = usdFinal;
    copVentaRaw = usdFinal * copRate;
    formulaActivaTexto = `[Costo COP] ${cfg.op1 === 'div' ? '÷' : '×'} ${val1} ${cfg.op2 === 'mul' ? '×' : cfg.op2 === 'div' ? '÷' : '+'} ${val2} ${cfg.op3 === 'div' ? '÷' : '×'} ${val3} = PRECIO FINAL BCV`;

  } else {
    // Modo 1 (DEFAULT): Fórmula Feria Los Cafeteros Institucional (3 Factores)
    const tasaCompra = safeRate(rates.tasaCompraCOP_USDT, 3150);
    const factorMargen = safeRate(rates.factorMargen, 880);
    const tasaDivisaBCV = safeRate(rates.tasaDivisaBCV, 765);

    usdtRaw = costoCOP / tasaCompra;
    copVentaRaw = usdtRaw * factorMargen;
    bcvRaw = copVentaRaw / tasaDivisaBCV;
    formulaActivaTexto = `[Costo COP] ÷ ${tasaCompra} × ${factorMargen} ÷ ${tasaDivisaBCV} = PRECIO FINAL BCV`;
  }

  // Redondeos comerciales SOLO para presentación al cliente
  const precioCOP = roundCommercialCOP(copVentaRaw, rates.tipoRedondeoCOP || 'centena');
  const precioBCV = roundCommercialBCV(bcvRaw, rates.tipoRedondeoBCV || 'entero');
  const precioRefDolarBCV = roundSafe(bcvRaw / bcvRate, 4);

  return {
    costoBaseCOP: costoCOP,
    usdtRaw: roundSafe(usdtRaw, 6),
    copVentaRaw: roundSafe(copVentaRaw, 2),
    bcvRaw: roundSafe(bcvRaw, 4),
    precioRefDolarBCV,       // Basado en valor exacto bcvRaw
    precioBaseUSD: precioRefDolarBCV,
    precioUSDT: roundSafe(usdtRaw, 2),
    precioCOP,               // Redondeado comercialmente
    precioBCV,               // Redondeado comercialmente
    formulaActivaTexto
  };
}

/**
 * Cálculo Universal Multimoneda de Precios de Venta y Referencial Dólar BCV.
 * Soporta rubros comprados en:
 *  - 🇨🇴 Pesos (COP): Fórmula institucional Feria.
 *  - 🇺🇸 Dólares (USD): Costo USD + Margen % → convierte a BCV y COP.
 *  - 🇻🇪 Bolívares (VES): Costo Bs. + Margen % → calcula Ref Dólar BCV y COP.
 */
export function calculateUniversalPrice(
  item: {
    precioBaseUSD?: number;
    monedaCosto?: string;
    costoOrigen?: number;
    margenPorcentaje?: number;
    costoBaseCOP?: number;
  },
  rates: Partial<CotizadorRates> = {}
) {
  const bcvRate = safeRate(rates.bcv, 76.50);
  const copRate = safeRate(rates.cop, 3850.00);
  const usdtRate = safeRate(rates.usdt, 1.00);
  const tipoRedondeoBCV = rates.tipoRedondeoBCV || 'entero';
  const tipoRedondeoCOP = rates.tipoRedondeoCOP || 'centena';

  const moneda = item.monedaCosto || (item.costoBaseCOP && item.costoBaseCOP > 0 ? 'COP' : 'USD');
  const costo = safeNum(item.costoOrigen, safeNum(item.costoBaseCOP, 0));
  const margen = safeNum(item.margenPorcentaje, 0);

  // CASO 1: Comprado en Pesos Colombianos (COP) → Motor Dinámico de Fórmulas
  if (moneda === 'COP' && costo > 0) {
    const feria = calculateFeriaPriceFromCost(costo, rates);
    return {
      monedaCosto: 'COP',
      costoOrigen: costo,
      precioRefDolarBCV: feria.precioRefDolarBCV,
      baseUSD: feria.precioRefDolarBCV,
      precioBaseUSD: feria.precioRefDolarBCV,
      precioBCV: feria.precioBCV,
      precioCOP: feria.precioCOP,
      precioUSDT: feria.precioUSDT,
      formulaActivaTexto: feria.formulaActivaTexto
    };
  }

  // CASO 2: Comprado en Bolívares (VES)
  if (moneda === 'VES' && costo > 0) {
    const precioVESExacto = margen > 0 ? costo * (1 + margen / 100) : costo;
    const precioBCV = roundCommercialBCV(precioVESExacto, tipoRedondeoBCV);
    const precioRefDolarBCV = roundSafe(precioVESExacto / bcvRate, 4);
    const precioCOP = roundCommercialCOP(precioRefDolarBCV * copRate, tipoRedondeoCOP);
    const precioUSDT = roundSafe(precioRefDolarBCV * usdtRate, 2);

    return {
      monedaCosto: 'VES',
      costoOrigen: costo,
      precioRefDolarBCV,
      baseUSD: precioRefDolarBCV,
      precioBaseUSD: precioRefDolarBCV,
      precioBCV,
      precioCOP,
      precioUSDT,
      formulaActivaTexto: `[Costo Bs.] + ${margen}% margen`
    };
  }

  // CASO 3: Comprado en Dólares (USD) o precio directo USD
  const baseUSDVal = costo > 0
    ? (margen > 0 ? roundSafe(costo * (1 + margen / 100), 4) : costo)
    : safeNum(item.precioBaseUSD, 1.50);

  const precioRefDolarBCV = roundSafe(baseUSDVal, 4);
  const precioBCV = roundCommercialBCV(baseUSDVal * bcvRate, tipoRedondeoBCV);
  const precioCOP = roundCommercialCOP(baseUSDVal * copRate, tipoRedondeoCOP);
  const precioUSDT = roundSafe(baseUSDVal * usdtRate, 2);

  return {
    monedaCosto: 'USD',
    costoOrigen: costo || baseUSDVal,
    precioRefDolarBCV,
    baseUSD: precioRefDolarBCV,
    precioBaseUSD: precioRefDolarBCV,
    precioBCV,
    precioCOP,
    precioUSDT,
    formulaActivaTexto: `[Costo USD] + ${margen}% margen`
  };
}

export class CotizadorCalculator {
  private rates: CotizadorRates;

  constructor(rates?: Partial<CotizadorRates>) {
    this.rates = {
      bcv: safeRate(rates?.bcv, 76.50),
      cop: safeRate(rates?.cop, 3850.00),
      usdt: safeRate(rates?.usdt, 1.00),
      paralelo: safeRate(rates?.paralelo, rates?.bcv || 76.50),
      spreadPercent: safeNum(rates?.spreadPercent, 0),
      lastUpdated: rates?.lastUpdated || new Date().toISOString(),

      // Fórmula Feria Dinámica
      tipoFormulaCOP: rates?.tipoFormulaCOP || 'feria_3_factores',
      tasaCompraCOP_USDT: safeRate(rates?.tasaCompraCOP_USDT, 3150),
      factorMargen: safeRate(rates?.factorMargen, 880),
      tasaDivisaBCV: safeRate(rates?.tasaDivisaBCV, 765),
      margenPorcentajeCOP: safeNum(rates?.margenPorcentajeCOP, 25),
      factorDirectoBCV: safeNum(rates?.factorDirectoBCV, 0.000365),
      formulaPersonalizada: rates?.formulaPersonalizada || {
        op1: 'div',
        val1: 3150,
        op2: 'mul',
        val2: 880,
        op3: 'div',
        val3: 765
      },
      tipoRedondeoBCV: rates?.tipoRedondeoBCV || 'entero',
      tipoRedondeoCOP: rates?.tipoRedondeoCOP || 'centena',
      modoCalculo: rates?.modoCalculo || 'formula_feria'
    };
  }

  setRates(rates: Partial<CotizadorRates>) {
    const bcv = safeRate(rates.bcv, this.rates.bcv);
    const cop = safeRate(rates.cop, this.rates.cop);
    const usdt = safeRate(rates.usdt, this.rates.usdt);
    this.rates = {
      ...this.rates,
      bcv,
      cop,
      usdt,
      paralelo: safeRate(rates.paralelo, bcv),
      spreadPercent: safeNum(rates.spreadPercent, 0),
      lastUpdated: new Date().toISOString(),

      tipoFormulaCOP: rates.tipoFormulaCOP || this.rates.tipoFormulaCOP || 'feria_3_factores',
      tasaCompraCOP_USDT: safeRate(rates.tasaCompraCOP_USDT, this.rates.tasaCompraCOP_USDT || 3150),
      factorMargen: safeRate(rates.factorMargen, this.rates.factorMargen || 880),
      tasaDivisaBCV: safeRate(rates.tasaDivisaBCV, this.rates.tasaDivisaBCV || 765),
      margenPorcentajeCOP: safeNum(rates.margenPorcentajeCOP, this.rates.margenPorcentajeCOP ?? 25),
      factorDirectoBCV: safeNum(rates.factorDirectoBCV, this.rates.factorDirectoBCV ?? 0.000365),
      formulaPersonalizada: rates.formulaPersonalizada || this.rates.formulaPersonalizada || {
        op1: 'div',
        val1: 3150,
        op2: 'mul',
        val2: 880,
        op3: 'div',
        val3: 765
      },
      tipoRedondeoBCV: rates.tipoRedondeoBCV || this.rates.tipoRedondeoBCV || 'entero',
      tipoRedondeoCOP: rates.tipoRedondeoCOP || this.rates.tipoRedondeoCOP || 'centena',
      modoCalculo: rates.modoCalculo || this.rates.modoCalculo || 'formula_feria'
    };
  }

  getRates(): CotizadorRates {
    return { ...this.rates };
  }

  calculateUnitPrices(
    precioBaseUSDOrItem: number | {
      precioBaseUSD?: number;
      monedaCosto?: string;
      costoOrigen?: number;
      margenPorcentaje?: number;
      costoBaseCOP?: number;
    },
    costoBaseCOP?: number
  ) {
    if (typeof precioBaseUSDOrItem === 'object' && precioBaseUSDOrItem !== null) {
      const res = calculateUniversalPrice(precioBaseUSDOrItem, this.rates);
      return {
        baseUSD: res.baseUSD,
        precioRefDolarBCV: res.precioRefDolarBCV,
        precioBCV: res.precioBCV,
        precioCOP: res.precioCOP,
        precioUSDT: res.precioUSDT
      };
    }

    const itemObj = {
      precioBaseUSD: Number(precioBaseUSDOrItem) || 0,
      costoBaseCOP
    };
    const res = calculateUniversalPrice(itemObj, this.rates);
    return {
      baseUSD: res.baseUSD,
      precioRefDolarBCV: res.precioRefDolarBCV,
      precioBCV: res.precioBCV,
      precioCOP: res.precioCOP,
      precioUSDT: res.precioUSDT
    };
  }

  calculateSingleItemPrices(item: {
    precioBaseUSD?: number;
    monedaCosto?: string;
    costoOrigen?: number;
    margenPorcentaje?: number;
    costoBaseCOP?: number;
  }) {
    return calculateUniversalPrice(item, this.rates);
  }

  /**
   * Conversión USDT → USD.
   * Soporta dos modos según el valor de rates.usdt:
   * - Si rates.usdt > 2.5: es la tasa en Bs./USDT (ej. 39.00 Bs/USDT)
   * - Si rates.usdt ≤ 2.5: es un multiplicador (ej. 1.00 = 1:1 con USD)
   */
  calculateUSDT(amountUSD: number): number {
    const usd = safeNum(amountUSD, 0);
    const rateUSDT = safeRate(this.rates.usdt, 1);
    const rateBCV = safeRate(this.rates.bcv, 76.50);

    if (rateUSDT > 2.5) {
      // Tasa en Bs./USDT: USD → Bs → USDT
      const totalVES = usd * rateBCV;
      return roundSafe(totalVES / rateUSDT, 2);
    }

    // Multiplicador: USD * factor
    return roundSafe(usd * rateUSDT, 2);
  }

  convertUSDTToUSD(usdtAmount: number): number {
    const usdt = safeNum(usdtAmount, 0);
    const rateUSDT = safeRate(this.rates.usdt, 1);
    const rateBCV = safeRate(this.rates.bcv, 76.50);

    if (rateUSDT > 2.5) {
      // USDT → Bs → USD
      const amountVES = usdt * rateUSDT;
      return roundSafe(amountVES / rateBCV, 6);
    }

    // Multiplicador inverso: USDT / factor
    return roundSafe(usdt / rateUSDT, 6);
  }

  /**
   * Calcula todos los campos derivados de un ítem de cotización.
   *
   * CORRECCIÓN BUG #2:
   * - subtotalUSD es el valor monetario canónico (exacto, 2 decimales).
   * - subtotalVES se deriva de subtotalUSD * bcvRate para garantizar coherencia.
   * - subtotalCOP se deriva de subtotalUSD * copRate para garantizar coherencia.
   * Esto asegura que totalVES == totalUSD * bcvRate en las tarjetas de resumen.
   */
  calculateItemTotals(item: CotizadorQuoteItem): CotizadorQuoteItem {
    const cantidad = Math.max(0.001, safeNum(item.cantidad, 1));
    const unidad = item.unidad || 'Kg';
    const avgKg = safeNum(item.pesoPromedioDefectoKg, 1.0);
    const taraKg = Math.max(0, safeNum(item.taraKg, 0));
    const lineDiscPct = Math.max(0, Math.min(100, safeNum(item.lineDiscountPercent, 0)));

    const unitPrices = this.calculateUnitPrices(item);
    const effectiveUSD = unitPrices.baseUSD;    // Precio unitario exacto en USD
    const bcvRate = safeRate(this.rates.bcv, 76.50);
    const copRate = safeRate(this.rates.cop, 3850.00);

    const grossKg = normalizeWeightToKg(cantidad, unidad, avgKg);
    const netKg = applyTare(grossKg, taraKg);
    const discountFactor = roundSafe(1 - (lineDiscPct / 100), 6);

    // Canon: el subtotal USD es la fuente de verdad
    const subtotalUSD = roundSafe(netKg * effectiveUSD * discountFactor, 2);

    // BUG #2 CORREGIDO: VES y COP derivados de subtotalUSD para coherencia total
    const subtotalVES = roundCommercialBCV(
      subtotalUSD * bcvRate,
      this.rates.tipoRedondeoBCV || 'entero'
    );
    const subtotalCOP = roundCommercialCOP(
      subtotalUSD * copRate,
      this.rates.tipoRedondeoCOP || 'centena'
    );
    const subtotalUSDT = this.calculateUSDT(subtotalUSD);

    return {
      ...item,
      cantidad,
      taraKg,
      lineDiscountPercent: lineDiscPct,
      grossKg,
      netKg,
      subtotalUSD,
      subtotalVES,
      subtotalCOP,
      subtotalUSDT,
      unitPrices
    };
  }

  /**
   * Calcula los totales consolidados de la cotización con descuento global.
   *
   * CORRECCIÓN BUG #3:
   * - finalTotalVES y finalTotalCOP se calculan desde finalTotalUSD * tasa,
   *   NO desde la suma de subtotales VES/COP individuales.
   * - Esto elimina la acumulación de errores de redondeo fila-por-fila.
   * - La suma de subtotalesVES se mantiene para mostrar detalle en la tabla,
   *   pero el TOTAL OFICIAL es el derivado de finalTotalUSD.
   */
  calculateQuotationTotals(items: CotizadorQuoteItem[] = [], discountPercent: number = 0): CotizadorTotals {
    let rawUSD = 0;
    let totalGrossKg = 0;
    let totalNetKg = 0;
    let totalItemsCount = 0;

    const calculatedItems = items.map(item => {
      const calculated = this.calculateItemTotals(item);
      rawUSD += calculated.subtotalUSD || 0;
      totalGrossKg += calculated.grossKg || 0;
      totalNetKg += calculated.netKg || 0;
      totalItemsCount += 1;
      return calculated;
    });

    rawUSD = roundSafe(rawUSD, 2);
    const discRatio = roundSafe(Math.max(0, Math.min(100, safeNum(discountPercent, 0))) / 100, 6);
    const discountAmountUSD = roundSafe(rawUSD * discRatio, 2);
    const finalTotalUSD = roundSafe(rawUSD - discountAmountUSD, 2);

    const bcvRate = safeRate(this.rates.bcv, 76.50);
    const copRate = safeRate(this.rates.cop, 3850.00);

    // BUG #3 CORREGIDO: Totales finales derivados de finalTotalUSD (no suma de filas redondeadas)
    const finalTotalVES = roundCommercialBCV(
      finalTotalUSD * bcvRate,
      this.rates.tipoRedondeoBCV || 'entero'
    );
    const finalTotalCOP = roundCommercialCOP(
      finalTotalUSD * copRate,
      this.rates.tipoRedondeoCOP || 'centena'
    );
    const finalTotalUSDT = this.calculateUSDT(finalTotalUSD);

    // Subtotales raw (VES/COP de filas, para referencia / auditoría)
    const rawTotalVES = roundSafe(rawUSD * bcvRate, 2);
    const rawTotalCOP = roundSafe(rawUSD * copRate, 0);

    return {
      items: calculatedItems,
      rawTotals: {
        totalUSD: rawUSD,
        totalVES: rawTotalVES,
        totalCOP: rawTotalCOP,
        totalUSDT: this.calculateUSDT(rawUSD)
      },
      discountPercent,
      discountAmountUSD,
      finalTotals: {
        totalUSD: finalTotalUSD,
        totalVES: finalTotalVES,
        totalBCV: finalTotalVES,
        totalCOP: finalTotalCOP,
        totalUSDT: finalTotalUSDT,
        totalGrossKg: roundSafe(totalGrossKg, 3),
        totalNetKg: roundSafe(totalNetKg, 3),
        totalKilos: roundSafe(totalNetKg, 3),
        totalItemsCount
      }
    };
  }

  /**
   * Motor de Pago Mixto (5 vías): USD + Zelle + USDT + Pago Móvil Bs + Efectivo COP
   *
   * Fórmula exacta:
   * totalPagadoUSD = usdCash + zelleUSD + USDT→USD + PagoMóvil(Bs)/tasaBCV + COP/tasaCOP
   * Δ = totalACobrarUSD - totalPagadoUSD
   * Si Δ > 0.005 → PENDIENTE (resta)
   * Si Δ < -0.005 → PAGADO CON VUELTO
   * Si |Δ| ≤ 0.005 → PAGO EXACTO
   */
  calculateMixedPayment(totalUSD: number, payments: Partial<SplitPaymentsInput>): SplitPaymentsResult {
    const totalDue = safeNum(totalUSD, 0);
    const usdCash = safeNum(payments.usdCash, 0);
    const zelleUSD = safeNum(payments.zelleUSD, 0);
    const usdtCash = safeNum(payments.usdtCash, 0);
    const bcvPagoMovil = safeNum(payments.bcvPagoMovil, 0);
    const copCash = safeNum(payments.copCash, 0);

    const bcvRate = safeRate(this.rates.bcv, 76.50);
    const copRate = safeRate(this.rates.cop, 3850.00);

    // Conversión de cada canal de pago a USD equivalente
    const usdFromUSDT = this.convertUSDTToUSD(usdtCash);
    const usdFromBCV = roundSafe(bcvPagoMovil / bcvRate, 6);
    const usdFromCOP = roundSafe(copCash / copRate, 6);

    const totalPaidUSD = roundSafe(usdCash + zelleUSD + usdFromUSDT + usdFromBCV + usdFromCOP, 6);
    const delta = roundSafe(totalDue - totalPaidUSD, 6);

    const TOLERANCE = 0.005; // 0.5 centavos de dólar
    const isPending = delta > TOLERANCE;
    const isOverpaid = delta < -TOLERANCE;
    const isExact = !isPending && !isOverpaid;

    const remainingUSD = isPending ? roundSafe(delta, 2) : 0;
    const changeUSD = isOverpaid ? roundSafe(-delta, 2) : 0;

    return {
      totalDueUSD: totalDue,
      totalPaidUSD: roundSafe(totalPaidUSD, 2),
      breakdown: {
        usdCash,
        zelleUSD,
        usdtCash,
        usdFromUSDT: roundSafe(usdFromUSDT, 2),
        bcvPagoMovil,
        usdFromBCV: roundSafe(usdFromBCV, 2),
        copCash,
        usdFromCOP: roundSafe(usdFromCOP, 2)
      },
      isExactPayment: isExact,
      isFullyPaid: !isPending,
      remainingUSD,
      // CORREGIDO: Restante calculado desde remainingUSD * tasas (no desde acumulación VES)
      remainingVES: isPending ? roundSafe(remainingUSD * bcvRate, 2) : 0,
      remainingBCV: isPending ? roundSafe(remainingUSD * bcvRate, 2) : 0,
      remainingCOP: isPending ? roundSafe(remainingUSD * copRate, 0) : 0,
      remainingUSDT: isPending ? this.calculateUSDT(remainingUSD) : 0,
      changeUSD,
      // CORREGIDO: Vuelto calculado desde changeUSD * tasas
      changeBCV: isOverpaid ? roundSafe(changeUSD * bcvRate, 2) : 0,
      changeVES: isOverpaid ? roundSafe(changeUSD * bcvRate, 2) : 0,
      changeCOP: isOverpaid ? roundSafe(changeUSD * copRate, 0) : 0
    };
  }

  static formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeNum(amount));
  }

  static formatBCV(amount: number): string {
    return `${safeNum(amount).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} Bs.`;
  }

  static formatCOP(amount: number): string {
    const num = Math.round(safeNum(amount));
    return `$ ${num.toLocaleString('es-CO')} COP`;
  }

  static formatUSDT(amount: number): string {
    return `₮ ${safeNum(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })} USDT`;
  }

  static formatWeight(kg: number, forceKg: boolean = false): string {
    const num = safeNum(kg);
    if (!forceKg && num > 0 && num < 1) {
      return `${Math.round(num * 1000)} g`;
    }
    return `${num.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    })} Kg`;
  }
}
