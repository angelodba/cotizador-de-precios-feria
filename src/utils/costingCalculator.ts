import type {
  ItemCosteo,
  ItemCosteoCalculado,
  TasasCosteo,
  TipoFormulaCosteo,
  FormulaPersonalizadaCosteo,
  OperadorPasoFormula,
  MonedaSalidaFormula,
  VariableEntradaFormula,
  PasoFormulaCustom,
  TipoValorPaso
} from '../types/costing';

export class CostingCalculator {
  /**
   * Parsea de manera segura cualquier entrada numérica de teclado móvil (iOS/Android con coma o punto)
   */
  static parseNumberInput(val: any, fallback: number = 0): number {
    if (val === null || val === undefined || val === '') return fallback;
    if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;

    const str = String(val).trim().replace(/[$BsCOPcopUSDTusdt\s\u00A0\u202F]/g, '');
    if (!str) return fallback;

    // Normalizar comas decimales típicas de teclados móviles en español
    if (str.includes('.') && str.includes(',')) {
      const lastDot = str.lastIndexOf('.');
      const lastComma = str.lastIndexOf(',');
      const normalized = lastComma > lastDot
        ? str.replace(/\./g, '').replace(',', '.')
        : str.replace(/,/g, '');
      const num = parseFloat(normalized);
      return Number.isFinite(num) ? num : fallback;
    }

    const num = parseFloat(str.replace(',', '.'));
    return Number.isFinite(num) ? num : fallback;
  }

  /**
   * Redondeo comercial según la preferencia seleccionada
   */
  static roundCommercialBCV(val: number, tipo: 'entero' | 'multiplo_5' | 'exacto' = 'entero'): number {
    const num = Number.isFinite(val) ? val : 0;
    if (tipo === 'exacto') {
      return Math.round(num * 100) / 100;
    }
    if (tipo === 'multiplo_5') {
      return Math.ceil(num / 5) * 5;
    }
    return Math.ceil(num);
  }

  /**
   * Conversión del Costo Base COP a USDT según la celda del CSV (90.000 COP ÷ 3150 = 28.57 USDT)
   */
  static calculateCostoBaseUSDT(costoCOP: number, tasaDivisor: number = 3200): number {
    if (!tasaDivisor || tasaDivisor <= 0) return 0;
    return Number((costoCOP / tasaDivisor).toFixed(2));
  }

  /**
   * Resuelve el valor real de un paso de fórmula (ya sea valor numérico manual, tasa del sistema o tasa personalizada del usuario)
   */
  static resolveStepValue(
    paso: PasoFormulaCustom,
    tasas?: Partial<TasasCosteo>
  ): { val: number; label: string } {
    const tipo = paso.tipoValor || 'manual';
    const fallbackVal = typeof paso.val === 'number' && !isNaN(paso.val) ? paso.val : 1;

    if (!tasas || tipo === 'manual') {
      return { val: fallbackVal, label: `${fallbackVal}` };
    }

    // 1. Revisar si coincide con una tasa personalizada creada por el usuario
    if (tasas.tasasPersonalizadas && Array.isArray(tasas.tasasPersonalizadas)) {
      const customFound = tasas.tasasPersonalizadas.find(t => t.id === tipo || t.id === paso.tasaId);
      if (customFound) {
        return { val: customFound.valor, label: `${customFound.nombre} (${customFound.valor})` };
      }
    }

    // 2. Revisar tasas estándar del sistema
    switch (tipo) {
      case 'tasa_bcv':
        return { val: tasas.tasaBCV || 76.50, label: `BCV (${(tasas.tasaBCV || 76.50).toFixed(2)})` };
      case 'tasa_paralelo':
        return { val: tasas.tasaParalelo || 95.00, label: `Paralelo (${(tasas.tasaParalelo || 95.00).toFixed(2)})` };
      case 'tasa_proveedor':
        return { val: tasas.tasaProveedor || 92.00, label: `Proveedor (${(tasas.tasaProveedor || 92.00).toFixed(2)})` };
      case 'tasa_cop':
        return { val: tasas.tasaCOP || 3850, label: `COP (${tasas.tasaCOP || 3850})` };
      case 'divisor_cop_usdt':
        return { val: tasas.tasaCompraCOP_USDT || 3200, label: `Divisor CSV (${tasas.tasaCompraCOP_USDT || 3200})` };
      case 'factor_margen':
        return { val: tasas.factorMargenCOP || 880, label: `Factor Margen (${tasas.factorMargenCOP || 880})` };
      case 'tasa_divisa_bcv':
        return { val: tasas.tasaDivisaBCV || 787, label: `Divisa Feria (${tasas.tasaDivisaBCV || 787})` };
      case 'tasa_usdt':
        return { val: tasas.tasaUSDT || 94.00, label: `USDT (${(tasas.tasaUSDT || 94.00).toFixed(2)})` };
      default:
        return { val: fallbackVal, label: `${fallbackVal}` };
    }
  }

  /**
   * Obtiene la etiqueta legible de una variable de inicio
   */
  static getVariableEntradaLabel(variableEntrada: VariableEntradaFormula): string {
    switch (variableEntrada) {
      case 'costo_origen_empaque':
        return '🔄 [Costo Origen Bulto] (Moneda Nativa)';
      case 'costo_origen_kilo':
        return '🔄 [Costo Origen Kilo] (Moneda Nativa)';
      case 'costo_bulto_cop':
        return '🇨🇴 [Costo Bulto COP]';
      case 'costo_kilo_cop':
        return '🇨🇴 [Costo Kilo COP]';
      case 'costo_bulto_ves':
        return '🇻🇪 [Costo Bulto Bs. VES]';
      case 'costo_kilo_ves':
        return '🇻🇪 [Costo Kilo Bs. VES]';
      case 'costo_bulto_usd':
        return '🇺🇸 [Costo Bulto USD Base]';
      case 'costo_kilo_usd':
        return '🇺🇸 [Costo Kilo USD Base]';
      case 'costo_bulto_usd_bcv':
        return '🇻🇪 [Costo Bulto USD @ BCV]';
      case 'costo_kilo_usd_bcv':
        return '🇻🇪 [Costo Kilo USD @ BCV]';
      case 'costo_bulto_usd_paralelo':
        return '📈 [Costo Bulto USD @ Paralelo]';
      case 'costo_kilo_usd_paralelo':
        return '📈 [Costo Kilo USD @ Paralelo]';
      case 'costo_bulto_usd_proveedor':
        return '🤝 [Costo Bulto USD @ Proveedor]';
      case 'costo_kilo_usd_proveedor':
        return '🤝 [Costo Kilo USD @ Proveedor]';
      case 'precio_base_usdt':
        return '📊 [Precio Base CSV USDT]';
      default:
        return '[Variable de Inicio]';
    }
  }

  /**
   * Evalúa la fórmula matemática con el Constructor Total de Fórmulas
   */
  static evaluateCustomFormula(
    valorInicialEntrada: number,
    cfg?: Partial<FormulaPersonalizadaCosteo>,
    tasaBCV: number = 76.50,
    tipoRedondeo: 'entero' | 'multiplo_5' | 'exacto' = 'entero',
    tasaCOP: number = 3850,
    tasasContexto?: Partial<TasasCosteo>
  ): {
    step1: number;
    step2: number;
    step3: number;
    pasosDetallados: Array<{
      indice: number;
      nombre: string;
      operador: OperadorPasoFormula;
      simbolo: string;
      valorPaso: number;
      valorAnterior: number;
      valorResultado: number;
      esDivisionPorCero: boolean;
      activo: boolean;
      tipoValor?: TipoValorPaso;
      etiquetaValor?: string;
    }>;
    monedaResultado: MonedaSalidaFormula;
    variableEntrada: VariableEntradaFormula;
    precioRaw: number;
    precioBCVRaw: number;
    precioBCV: number;
    precioUSD: number;
    precioCOP: number;
    formulaText: string;
    tieneDivisionPorCero: boolean;
  } {
    const monedaResultado: MonedaSalidaFormula = cfg?.monedaResultado || 'VES';
    const variableEntrada: VariableEntradaFormula = cfg?.variableEntrada || 'costo_origen_empaque';

    const mergedTasas: Partial<TasasCosteo> = {
      tasaBCV,
      tasaCOP,
      ...tasasContexto
    };

    // Obtener la lista de pasos o crear los pasos iniciales desde op1/op2/op3
    let pasos: PasoFormulaCustom[] = [];
    if (cfg?.pasos && Array.isArray(cfg.pasos) && cfg.pasos.length > 0) {
      pasos = cfg.pasos.map(p => ({
        id: p.id || `p-${Math.random()}`,
        nombre: p.nombre || 'Paso',
        op: p.op || 'mul',
        val: typeof p.val === 'number' && !isNaN(p.val) ? p.val : 0,
        tipoValor: p.tipoValor || 'manual',
        tasaId: p.tasaId,
        activo: p.activo !== false
      }));
    } else {
      pasos = [
        {
          id: 'p-1',
          nombre: 'Paso 1: Divisor Compra',
          op: cfg?.op1 || 'div',
          val: typeof cfg?.val1 === 'number' && !isNaN(cfg.val1) ? cfg.val1 : 3200,
          tipoValor: 'divisor_cop_usdt',
          activo: true
        },
        {
          id: 'p-2',
          nombre: 'Paso 2: Margen Feria',
          op: cfg?.op2 || 'mul',
          val: typeof cfg?.val2 === 'number' && !isNaN(cfg.val2) ? cfg.val2 : 880,
          tipoValor: 'factor_margen',
          activo: true
        },
        {
          id: 'p-3',
          nombre: 'Paso 3: Divisa Feria',
          op: cfg?.op3 || 'div',
          val: typeof cfg?.val3 === 'number' && !isNaN(cfg.val3) ? cfg.val3 : (monedaResultado === 'USD' ? 1 : 787),
          tipoValor: monedaResultado === 'USD' ? 'manual' : 'tasa_divisa_bcv',
          activo: true
        }
      ];
    }

    let currentValue = valorInicialEntrada;
    let tieneDivisionPorCero = false;
    const pasosDetallados: Array<{
      indice: number;
      nombre: string;
      operador: OperadorPasoFormula;
      simbolo: string;
      valorPaso: number;
      valorAnterior: number;
      valorResultado: number;
      esDivisionPorCero: boolean;
      activo: boolean;
      tipoValor?: TipoValorPaso;
      etiquetaValor?: string;
    }> = [];

    const formulaParts: string[] = [];
    formulaParts.push(this.getVariableEntradaLabel(variableEntrada));

    pasos.forEach((paso, idx) => {
      const { val: effectiveVal, label: valLabel } = this.resolveStepValue(paso, mergedTasas);
      const valorAnterior = currentValue;
      let valorResultado = currentValue;
      let esDivisionPorCero = false;
      let simbolo = '×';

      if (!paso.activo || paso.op === 'none') {
        simbolo = '(Omitido)';
        valorResultado = currentValue;
      } else {
        switch (paso.op) {
          case 'div':
            simbolo = '÷';
            if (effectiveVal === 0) {
              esDivisionPorCero = true;
              tieneDivisionPorCero = true;
              valorResultado = 0;
            } else {
              valorResultado = currentValue / effectiveVal;
            }
            break;
          case 'mul':
            simbolo = '×';
            valorResultado = currentValue * effectiveVal;
            break;
          case 'add':
            simbolo = '+';
            valorResultado = currentValue + effectiveVal;
            break;
          case 'sub':
            simbolo = '-';
            valorResultado = currentValue - effectiveVal;
            break;
          case 'percent_add':
            simbolo = '+%';
            valorResultado = currentValue * (1 + effectiveVal / 100);
            break;
          case 'percent_sub':
            simbolo = '-%';
            valorResultado = currentValue * (1 - effectiveVal / 100);
            break;
          default:
            simbolo = '×';
            valorResultado = currentValue * effectiveVal;
        }

        formulaParts.push(`${simbolo} ${valLabel}`);
      }

      currentValue = valorResultado;

      pasosDetallados.push({
        indice: idx + 1,
        nombre: paso.nombre || `Paso ${idx + 1}`,
        operador: paso.op,
        simbolo,
        valorPaso: effectiveVal,
        valorAnterior: Number(valorAnterior.toFixed(4)),
        valorResultado: Number(valorResultado.toFixed(4)),
        esDivisionPorCero,
        activo: paso.activo,
        tipoValor: paso.tipoValor,
        etiquetaValor: valLabel
      });
    });

    const rawResult = Math.max(0, currentValue);

    let precioUSD = 0;
    let precioBCVRaw = 0;
    let precioBCV = 0;
    let precioCOP = 0;

    if (monedaResultado === 'USD') {
      // Salida en DÓLARES ($ USD/Kg)
      precioUSD = Number(rawResult.toFixed(2));
      precioBCVRaw = rawResult * tasaBCV;
      precioBCV = this.roundCommercialBCV(precioBCVRaw, tipoRedondeo);
      precioCOP = Math.round(precioUSD * tasaCOP / 100) * 100;
      formulaParts.push(`= PRECIO FINAL DÓLARES ($ USD/Kg)`);
    } else if (monedaResultado === 'COP') {
      // Salida en PESOS COLOMBIANOS (COP)
      precioCOP = Math.round(rawResult);
      precioUSD = tasaCOP > 0 ? Number((precioCOP / tasaCOP).toFixed(2)) : 0;
      precioBCVRaw = precioUSD * tasaBCV;
      precioBCV = this.roundCommercialBCV(precioBCVRaw, tipoRedondeo);
      formulaParts.push(`= PRECIO FINAL COP (Pesos/Kg)`);
    } else {
      // Salida en BOLÍVARES (Bs/Kg BCV)
      precioBCVRaw = rawResult;
      precioBCV = this.roundCommercialBCV(precioBCVRaw, tipoRedondeo);
      precioUSD = tasaBCV > 0 ? Number((precioBCV / tasaBCV).toFixed(2)) : 0;
      precioCOP = Math.round(precioUSD * tasaCOP / 100) * 100;
      formulaParts.push(`= PRECIO FINAL BCV (Bs/Kg)`);
    }

    const formulaText = formulaParts.join(' ');

    return {
      step1: pasosDetallados[0]?.valorResultado || 0,
      step2: pasosDetallados[1]?.valorResultado || 0,
      step3: pasosDetallados[2]?.valorResultado || 0,
      pasosDetallados,
      monedaResultado,
      variableEntrada,
      precioRaw: Number(rawResult.toFixed(4)),
      precioBCVRaw: Number(precioBCVRaw.toFixed(4)),
      precioBCV,
      precioUSD,
      precioCOP,
      formulaText,
      tieneDivisionPorCero
    };
  }

  /**
   * Obtiene la descripción textual y notación de la estrategia activa
   */
  static getFormulaDescriptor(tasas: TasasCosteo): {
    tipo: string;
    titulo: string;
    notacion: string;
    descripcion: string;
  } {
    const tipo = tasas.tipoFormula || 'formula_csv_usdt';
    const tasaDivisor = tasas.tasaCompraCOP_USDT || 3200;
    const factorMargen = tasas.factorMargenCOP || 880;
    const tasaDivisa = tasas.tasaDivisaBCV || 787;

    switch (tipo) {
      case 'formula_feria_3factores':
        return {
          tipo,
          titulo: '🌟 Oficial Feria (3 Factores)',
          notacion: `[Costo Bulto COP] ÷ ${tasaDivisor} × ${factorMargen} ÷ ${tasaDivisa} = PRECIO FINAL BCV (Bs/Kg)`,
          descripcion: 'Fórmula institucional de 3 factores para compras en Pesos Colombianos con salida en Bolívares.'
        };
      case 'formula_personalizada': {
        const evalRes = this.evaluateCustomFormula(
          0,
          tasas.formulaPersonalizada,
          tasas.tasaBCV,
          tasas.tipoRedondeoBCV,
          tasas.tasaCOP,
          tasas
        );
        const monedaLabel = evalRes.monedaResultado === 'USD' ? 'Dólares ($ USD)' : evalRes.monedaResultado === 'COP' ? 'Pesos (COP)' : 'Bolívares (Bs. BCV)';
        return {
          tipo,
          titulo: `🛠️ Constructor Total (${monedaLabel})`,
          notacion: evalRes.formulaText,
          descripcion: `Constructor matemático libre con soporte para compras en Bolívares, Pesos y Dólares a cualquier tasa personalizada.`
        };
      }
      case 'margen_porcentaje':
        return {
          tipo,
          titulo: '📈 Margen Porcentual %',
          notacion: '[Costo x Kilo USD] × (1 + Margen %) = USD ➔ Convertido a Bs BCV',
          descripcion: 'Margen de ganancia comercial porcentual clásico sobre el costo real.'
        };
      case 'formula_csv_usdt':
      default:
        return {
          tipo,
          titulo: '📊 Fórmula CSV (Matriz USDT)',
          notacion: `[Costo COP] ÷ ${tasaDivisor} = USDT ➔ USDT × ${tasas.tasaBCV.toFixed(2)} = Bs.`,
          descripcion: 'Precios base unitarios en USDT vinculados a la cotización oficial BCV.'
        };
    }
  }

  /**
   * Obtiene la descripción textual de la estrategia y fórmula activa de un rubro específico
   */
  static getItemFormulaDescriptor(item: ItemCosteo, tasas: TasasCosteo): {
    esPropia: boolean;
    tipo: string;
    titulo: string;
    notacion: string;
  } {
    const tienePropia = !!(item.tipoFormulaItem && item.tipoFormulaItem !== 'heredar_global');
    const estrategiaEfectiva = tienePropia ? item.tipoFormulaItem! : (tasas.tipoFormula || 'formula_csv_usdt');

    if (!tienePropia) {
      const globalDesc = this.getFormulaDescriptor(tasas);
      return {
        esPropia: false,
        tipo: globalDesc.tipo,
        titulo: `🌐 Global (${globalDesc.titulo})`,
        notacion: globalDesc.notacion
      };
    }

    // Tiene estrategia propia
    if (estrategiaEfectiva === 'formula_personalizada' && item.formulaPersonalizadaItem) {
      const evalRes = this.evaluateCustomFormula(
        0,
        item.formulaPersonalizadaItem,
        tasas.tasaBCV,
        tasas.tipoRedondeoBCV,
        tasas.tasaCOP,
        tasas
      );
      return {
        esPropia: true,
        tipo: 'formula_personalizada',
        titulo: '🛠️ Fórmula Exclusiva del Rubro',
        notacion: evalRes.formulaText
      };
    }

    if (estrategiaEfectiva === 'formula_feria_3factores') {
      const tasaDivisor = tasas.tasaCompraCOP_USDT || 3150;
      const factorMargen = tasas.factorMargenCOP || 880;
      const tasaDivisa = tasas.tasaDivisaBCV || 765;
      return {
        esPropia: true,
        tipo: 'formula_feria_3factores',
        titulo: '🌟 Oficial Feria (3 Factores)',
        notacion: `[Costo Bulto COP] ÷ ${tasaDivisor} × ${factorMargen} ÷ ${tasaDivisa} = Bs/Kg`
      };
    }

    if (estrategiaEfectiva === 'margen_porcentaje') {
      return {
        esPropia: true,
        tipo: 'margen_porcentaje',
        titulo: `📈 Margen Directo (${item.margenPorcentaje}%)`,
        notacion: `[Costo x Kilo USD] + ${item.margenPorcentaje}%`
      };
    }

    return {
      esPropia: true,
      tipo: 'formula_csv_usdt',
      titulo: '📊 Matriz USDT',
      notacion: `Precio Base: $${item.precioBaseUSDT || 0} USDT`
    };
  }

  /**
   * Resuelve la tasa de compra efectiva para un producto según la selección del usuario
   */
  static resolveItemPurchaseRate(item: ItemCosteo, tasas: TasasCosteo): number {
    const tasaBCV = Math.max(0.01, Number(tasas.tasaBCV) || 76.50);
    const tasaParalelo = Math.max(0.01, Number(tasas.tasaParalelo) || 95.00);
    const tasaProveedor = Math.max(0.01, Number(tasas.tasaProveedor) || 92.00);

    // 1. Tasa pactada personalizada directa
    if (item.tipoTasaCosto === 'personalizada' && item.tasaCompraPersonalizada && item.tasaCompraPersonalizada > 0) {
      return item.tasaCompraPersonalizada;
    }

    // 2. Buscar en la lista de tasas personalizadas del usuario si se seleccionó por ID
    if (tasas.tasasPersonalizadas && Array.isArray(tasas.tasasPersonalizadas)) {
      const customFound = tasas.tasasPersonalizadas.find(t => t.id === item.tipoTasaCosto || t.id === item.tasaPersonalizadaId);
      if (customFound && customFound.valor > 0) {
        return customFound.valor;
      }
    }

    // 3. Tasas estándar
    if (item.tipoTasaCosto === 'paralelo') return tasaParalelo;
    if (item.tipoTasaCosto === 'proveedor') return tasaProveedor;
    return tasaBCV;
  }

  /**
   * Resuelve el precio base en USDT de un rubro buscando en sus propiedades locales o en la tabla de tasas
   */
  static resolveItemBasePriceUSDT(item: ItemCosteo, tasas?: Partial<TasasCosteo>): number {
    if (typeof item.precioBaseUSDT === 'number' && item.precioBaseUSDT > 0) {
      return item.precioBaseUSDT;
    }

    const dict = tasas?.preciosBaseUSDT;
    if (!dict) return 0;

    // 1. Coincidencia exacta por nombre
    if (dict[item.nombre] !== undefined && dict[item.nombre] > 0) {
      return dict[item.nombre];
    }

    // 2. Coincidencia normalizada / aproximada (ej: "Papa Amarilla / Blanca" -> "Papa")
    const cleanItemName = item.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    for (const [key, val] of Object.entries(dict)) {
      if (typeof val === 'number' && val > 0) {
        const cleanKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (cleanItemName === cleanKey || cleanItemName.startsWith(cleanKey) || cleanItemName.includes(cleanKey)) {
          return val;
        }
      }
    }

    return 0;
  }

  /**
   * Calcula todos los costos y precios de venta para un rubro
   * con conversiones multi-moneda matemáticamente exactas
   */
  static calculateItem(item: ItemCosteo, tasas: TasasCosteo): ItemCosteoCalculado {
    const pesoBruto = Math.max(0.1, Number(item.pesoEmpaqueKg) || 1);
    // Merma desactivada / 0% por requerimiento operativo de feria (kilos netos = peso bruto)
    const mermaPct = Math.max(0, Math.min(100, Number(item.mermaPorcentaje) || 0));
    const margenDetalPct = Math.max(0, Number(item.margenPorcentaje) || 0);
    const margenMayorPct = Math.max(0, Number(item.margenMayoristaPorcentaje) || 15);
    
    // Tasas del sistema
    const tasaBCV = Math.max(0.01, Number(tasas.tasaBCV) || 76.50);
    const tasaParalelo = Math.max(0.01, Number(tasas.tasaParalelo) || 95.00);
    const tasaProveedor = Math.max(0.01, Number(tasas.tasaProveedor) || 92.00);
    const tasaCOP = Math.max(1, Number(tasas.tasaCOP) || 3850);

    // Tasa efectiva con la que se compró el lote
    const tasaEfectivaCompra = this.resolveItemPurchaseRate(item, tasas);

    // Determinar la estrategia de cálculo activa para este rubro
    const tieneFormulaPropia = !!(item.tipoFormulaItem && item.tipoFormulaItem !== 'heredar_global');
    const tipoFormula: TipoFormulaCosteo = tieneFormulaPropia
      ? (item.tipoFormulaItem as TipoFormulaCosteo)
      : (tasas.tipoFormula || 'margen_porcentaje');

    const formulaPersonalizadaConfig: FormulaPersonalizadaCosteo = (tieneFormulaPropia && item.formulaPersonalizadaItem)
      ? item.formulaPersonalizadaItem
      : (tasas.formulaPersonalizada || {
          variableEntrada: 'costo_origen_empaque',
          monedaResultado: 'VES',
          pasos: [
            { id: 'p-1', nombre: 'Paso 1: Divisor Compra', op: 'div', val: 3200, tipoValor: 'divisor_cop_usdt', activo: true },
            { id: 'p-2', nombre: 'Paso 2: Margen Feria', op: 'mul', val: 880, tipoValor: 'factor_margen', activo: true },
            { id: 'p-3', nombre: 'Paso 3: Divisa Feria', op: 'div', val: 787, tipoValor: 'tasa_divisa_bcv', activo: true }
          ]
        });

    // 1. Kilos Netos Aprovechables (100% aprovechable, sin restar merma artificial)
    const factorMerma = mermaPct > 0 ? (1 - mermaPct / 100) : 1;
    const kilosNetosAprovechables = Math.max(0.1, pesoBruto * factorMerma);

    // 2. CONVERSIONES MULTIMONEDA EXACTAS DEL COSTO DE COMPRA
    const costoMontoIngresado = Number(item.costoEmpaque) || 0;
    const fleteUSD = Number(item.fleteUnitario) || 0;

    let costoEmpaqueUSD = 0;
    let costoEmpaqueVES = 0;
    let costoEmpaqueCOP = 0;

    if (item.monedaCosto === 'COP') {
      // ─── COMPRA EN PESOS COLOMBIANOS (FÓRMULA FERIA EXACTA) ───
      // Ejemplo usuario: 100.000 COP ÷ 3.2 = 31.250 ÷ 787 = 39.70 USD
      // Equivalente a: (100.000 ÷ 3200) ÷ 0.787 = 31.25 ÷ 0.787 = 39.7077 USD
      costoEmpaqueCOP = costoMontoIngresado;

      const rawDivisor = Number(tasas.tasaCompraCOP_USDT) || 3200;
      const divisorNorm = rawDivisor <= 10 ? (rawDivisor * 1000) : rawDivisor; // 3.2 -> 3200
      const rawFactor = Number(tasas.tasaDivisaBCV) || 787;
      const factorNorm = rawFactor > 10 ? (rawFactor / 1000) : rawFactor; // 787 -> 0.787

      if (divisorNorm > 0 && factorNorm > 0) {
        costoEmpaqueUSD = (costoMontoIngresado / divisorNorm) / factorNorm;
      } else if (tasaCOP > 0) {
        costoEmpaqueUSD = costoMontoIngresado / tasaCOP;
      } else {
        costoEmpaqueUSD = 0;
      }

      costoEmpaqueVES = costoEmpaqueUSD * tasaBCV;
    } else if (item.monedaCosto === 'VES') {
      // Compra en Bolívares
      costoEmpaqueVES = costoMontoIngresado;
      costoEmpaqueUSD = costoMontoIngresado / tasaEfectivaCompra;
      costoEmpaqueCOP = tasaCOP > 0 ? (costoEmpaqueUSD * tasaCOP) : 0;
    } else {
      // Compra en Dólares (USD)
      costoEmpaqueUSD = costoMontoIngresado;
      costoEmpaqueVES = costoMontoIngresado * tasaEfectivaCompra;
      costoEmpaqueCOP = costoMontoIngresado * tasaCOP;
    }

    // Costo Total con Flete incorporado
    const costoTotalEmpaqueUSD = costoEmpaqueUSD + fleteUSD;
    const costoTotalEmpaqueVES = costoEmpaqueVES + (fleteUSD * tasaBCV);
    const costoTotalEmpaqueCOP = costoEmpaqueCOP + (fleteUSD * tasaCOP);

    // 3. Costos Unitarios por Kilo
    const costoKiloUSD = costoTotalEmpaqueUSD / kilosNetosAprovechables;
    const costoKiloVES = costoTotalEmpaqueVES / kilosNetosAprovechables;
    const costoKiloCOP = costoTotalEmpaqueCOP / kilosNetosAprovechables;

    // Variantes según diferentes tasas de Venezuela
    const costoBultoUSD_BCV = item.monedaCosto === 'VES' ? (costoMontoIngresado / tasaBCV) : costoEmpaqueUSD;
    const costoKiloUSD_BCV = (costoBultoUSD_BCV + fleteUSD) / kilosNetosAprovechables;

    const costoBultoUSD_Paralelo = item.monedaCosto === 'VES'
      ? (costoMontoIngresado / tasaParalelo)
      : item.monedaCosto === 'USD'
        ? costoMontoIngresado
        : (costoEmpaqueVES / tasaParalelo);
    const costoKiloUSD_Paralelo = (costoBultoUSD_Paralelo + fleteUSD) / kilosNetosAprovechables;

    const costoBultoUSD_Proveedor = item.monedaCosto === 'VES'
      ? (costoMontoIngresado / tasaProveedor)
      : item.monedaCosto === 'USD'
        ? costoMontoIngresado
        : (costoEmpaqueVES / tasaProveedor);
    const costoKiloUSD_Proveedor = (costoBultoUSD_Proveedor + fleteUSD) / kilosNetosAprovechables;

    // 4. PRECIO DE VENTA AL DETAL POR KILO (SEGÚN FIJACIÓN MANUAL O ESTRATEGIA ACTIVA)
    let precioVentaDetalKiloUSD = 0;
    let precioVentaDetalKiloVESRaw = 0;

    const baseUSDT = this.resolveItemBasePriceUSDT(item, tasas);

    // ─── PRIORIDAD 1: PRECIO FIJADO MANUALMENTE POR EL USUARIO EN LA PIZARRA ───
    if (item.modoPrecioPizarra === 'manual_usd' && typeof item.precioManualFijadoUSD === 'number' && item.precioManualFijadoUSD > 0) {
      precioVentaDetalKiloUSD = item.precioManualFijadoUSD;
      precioVentaDetalKiloVESRaw = item.precioManualFijadoUSD * tasaBCV;
    } else if (item.modoPrecioPizarra === 'manual_ves' && typeof item.precioManualFijadoVES === 'number' && item.precioManualFijadoVES > 0) {
      precioVentaDetalKiloVESRaw = item.precioManualFijadoVES;
      precioVentaDetalKiloUSD = tasaBCV > 0 ? Number((item.precioManualFijadoVES / tasaBCV).toFixed(2)) : 0;
    } else if (tipoFormula === 'formula_feria_3factores') {
      // ─── ESTRATEGIA: FÓRMULA FERIA NATIVA (COP ➔ Divisor ➔ Kilos ➔ BCV) ───
      // Fórmula: [Costo Saco COP] ÷ [Divisor COP/Bs (ej. 3.2)] ÷ [Kilos Netos (ej. 22)] = Bs/Kg
      // Y luego [Bs/Kg] ÷ [Tasa BCV] = USD/Kg ($1.80)
      const rawDivisor = Number(tasas.tasaCompraCOP_USDT) || 3.2;
      const divisorEfectivo = rawDivisor > 100 ? (rawDivisor / 1000) : rawDivisor; // Soporta tanto 3.2 como 3200
      const bultoCOP = costoTotalEmpaqueCOP > 0 ? costoTotalEmpaqueCOP : (costoTotalEmpaqueUSD * tasaCOP);

      if (bultoCOP > 0 && divisorEfectivo > 0 && kilosNetosAprovechables > 0) {
        precioVentaDetalKiloVESRaw = bultoCOP / (divisorEfectivo * kilosNetosAprovechables);
        precioVentaDetalKiloUSD = tasaBCV > 0 ? (precioVentaDetalKiloVESRaw / tasaBCV) : 0;
      } else {
        const factorMargenDetal = 1 + (margenDetalPct / 100);
        precioVentaDetalKiloUSD = costoKiloUSD * factorMargenDetal;
        precioVentaDetalKiloVESRaw = precioVentaDetalKiloUSD * tasaBCV;
      }
    } else if (tipoFormula === 'formula_csv_usdt') {
      // ─── ESTRATEGIA: PRECIO DIRECTO EN DÓLARES ($ USD/Kg ➔ Bs. BCV) ───
      if (baseUSDT > 0) {
        precioVentaDetalKiloUSD = baseUSDT;
        precioVentaDetalKiloVESRaw = baseUSDT * tasaBCV;
      } else {
        // Si no tiene precio directo fijado, usar fórmula de feria nativa si viene en COP
        const rawDivisor = Number(tasas.tasaCompraCOP_USDT) || 3.2;
        const divisorEfectivo = rawDivisor > 100 ? (rawDivisor / 1000) : rawDivisor;
        const bultoCOP = costoTotalEmpaqueCOP > 0 ? costoTotalEmpaqueCOP : (costoTotalEmpaqueUSD * tasaCOP);

        if (bultoCOP > 0 && divisorEfectivo > 0 && kilosNetosAprovechables > 0) {
          precioVentaDetalKiloVESRaw = bultoCOP / (divisorEfectivo * kilosNetosAprovechables);
          precioVentaDetalKiloUSD = tasaBCV > 0 ? (precioVentaDetalKiloVESRaw / tasaBCV) : 0;
        } else {
          const factorMargenDetal = 1 + (margenDetalPct / 100);
          precioVentaDetalKiloUSD = costoKiloUSD * factorMargenDetal;
          precioVentaDetalKiloVESRaw = precioVentaDetalKiloUSD * tasaBCV;
        }
      }
    } else if (tipoFormula === 'formula_personalizada') {
      // Estrategia 4: Constructor Total Multi-Tasa
      const varEntrada = formulaPersonalizadaConfig.variableEntrada || 'costo_origen_empaque';
      let valorInicialEntrada = costoMontoIngresado;

      switch (varEntrada) {
        case 'costo_origen_empaque':
          valorInicialEntrada = costoMontoIngresado;
          break;
        case 'costo_origen_kilo':
          valorInicialEntrada = costoMontoIngresado / kilosNetosAprovechables;
          break;
        case 'costo_bulto_cop':
          valorInicialEntrada = costoTotalEmpaqueCOP;
          break;
        case 'costo_kilo_cop':
          valorInicialEntrada = costoKiloCOP;
          break;
        case 'costo_bulto_ves':
          valorInicialEntrada = costoTotalEmpaqueVES;
          break;
        case 'costo_kilo_ves':
          valorInicialEntrada = costoKiloVES;
          break;
        case 'costo_bulto_usd':
          valorInicialEntrada = costoTotalEmpaqueUSD;
          break;
        case 'costo_kilo_usd':
          valorInicialEntrada = costoKiloUSD;
          break;
        case 'costo_bulto_usd_bcv':
          valorInicialEntrada = costoBultoUSD_BCV + fleteUSD;
          break;
        case 'costo_kilo_usd_bcv':
          valorInicialEntrada = costoKiloUSD_BCV;
          break;
        case 'costo_bulto_usd_paralelo':
          valorInicialEntrada = costoBultoUSD_Paralelo + fleteUSD;
          break;
        case 'costo_kilo_usd_paralelo':
          valorInicialEntrada = costoKiloUSD_Paralelo;
          break;
        case 'costo_bulto_usd_proveedor':
          valorInicialEntrada = costoBultoUSD_Proveedor + fleteUSD;
          break;
        case 'costo_kilo_usd_proveedor':
          valorInicialEntrada = costoKiloUSD_Proveedor;
          break;
        case 'precio_base_usdt':
          valorInicialEntrada = baseUSDT > 0 ? baseUSDT : (Number(item.precioBaseUSDT) || 1);
          break;
        default:
          valorInicialEntrada = costoMontoIngresado;
      }

      const res = this.evaluateCustomFormula(
        valorInicialEntrada,
        formulaPersonalizadaConfig,
        tasaBCV,
        tasas.tipoRedondeoBCV,
        tasaCOP,
        tasas
      );
      precioVentaDetalKiloVESRaw = res.precioBCVRaw;
      precioVentaDetalKiloUSD = res.precioUSD;
    } else {
      // Estrategia 3: Margen Porcentual % Clásico
      const factorMargenDetal = 1 + (margenDetalPct / 100);
      precioVentaDetalKiloUSD = costoKiloUSD * factorMargenDetal;
      precioVentaDetalKiloVESRaw = precioVentaDetalKiloUSD * tasaBCV;
    }

    const precioVentaDetalKiloVES = this.roundCommercialBCV(precioVentaDetalKiloVESRaw, tasas.tipoRedondeoBCV);
    const precioVentaDetalKiloCOP = tasaCOP > 0 ? Math.round(precioVentaDetalKiloUSD * tasaCOP / 100) * 100 : 0;

    // 5. Precios al Mayor
    // Base: precio detal activo (según estrategia) descontando el margen mayorista
    // Así se mantiene la coherencia con la estrategia de fórmula activa
    const descuentoMayor = Math.max(0, Math.min(99, margenMayorPct));
    const precioVentaMayorKiloUSD = precioVentaDetalKiloUSD * (1 - descuentoMayor / 100);
    const precioVentaMayorKiloVES = this.roundCommercialBCV(precioVentaMayorKiloUSD * tasaBCV, tasas.tipoRedondeoBCV);
    const precioVentaMayorEmpaqueUSD = precioVentaMayorKiloUSD * kilosNetosAprovechables;
    const precioVentaMayorEmpaqueVES = this.roundCommercialBCV(precioVentaMayorEmpaqueUSD * tasaBCV, tasas.tipoRedondeoBCV);

    // 6. Ganancia y Rentabilidad
    const gananciaPorKiloUSD = precioVentaDetalKiloUSD - costoKiloUSD;
    const gananciaPorKiloVES = precioVentaDetalKiloVES - costoKiloVES;
    const gananciaTotalEmpaqueUSD = gananciaPorKiloUSD * kilosNetosAprovechables;
    const gananciaTotalEmpaqueVES = gananciaTotalEmpaqueUSD * tasaBCV;
    const rentabilidadRealPct = costoTotalEmpaqueUSD > 0 ? (gananciaTotalEmpaqueUSD / costoTotalEmpaqueUSD) * 100 : 0;

    return {
      ...item,
      kilosNetosAprovechables: Number(kilosNetosAprovechables.toFixed(2)),
      costoTotalEmpaqueUSD: Number(costoTotalEmpaqueUSD.toFixed(2)),
      costoTotalEmpaqueVES: Number(costoTotalEmpaqueVES.toFixed(2)),
      costoTotalEmpaqueCOP: Math.round(costoTotalEmpaqueCOP),
      costoKiloUSD: Number(costoKiloUSD.toFixed(3)),
      costoKiloVES: Number(costoKiloVES.toFixed(2)),
      costoKiloCOP: Math.round(costoKiloCOP),
      precioVentaDetalKiloUSD: Number(precioVentaDetalKiloUSD.toFixed(2)),
      precioVentaDetalKiloVES: precioVentaDetalKiloVES,
      precioVentaDetalKiloCOP: precioVentaDetalKiloCOP,
      precioVentaMayorKiloUSD: Number(precioVentaMayorKiloUSD.toFixed(2)),
      precioVentaMayorKiloVES: precioVentaMayorKiloVES,
      precioVentaMayorEmpaqueUSD: Number(precioVentaMayorEmpaqueUSD.toFixed(2)),
      precioVentaMayorEmpaqueVES: precioVentaMayorEmpaqueVES,
      gananciaPorKiloUSD: Number(gananciaPorKiloUSD.toFixed(2)),
      gananciaPorKiloVES: Number(gananciaPorKiloVES.toFixed(2)),
      gananciaTotalEmpaqueUSD: Number(gananciaTotalEmpaqueUSD.toFixed(2)),
      gananciaTotalEmpaqueVES: Number(gananciaTotalEmpaqueVES.toFixed(2)),
      rentabilidadRealPct: Number(rentabilidadRealPct.toFixed(1))
    };
  }

  /**
   * Formato en Bolívares con protección anti-NaN
   */
  static formatVES(val: number): string {
    const safe = Number.isFinite(val) ? val : 0;
    return `${safe.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.`;
  }

  /**
   * Formato en Dólares con protección anti-NaN
   */
  static formatUSD(val: number): string {
    const safe = Number.isFinite(val) ? val : 0;
    return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formato en Pesos COP con protección anti-NaN
   */
  static formatCOP(val: number): string {
    const safe = Number.isFinite(val) ? val : 0;
    return `${Math.round(safe).toLocaleString('es-CO')} COP`;
  }
}
