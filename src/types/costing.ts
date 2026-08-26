export type TipoEmpaque = 'Saco' | 'Cesta' | 'Bulto' | 'Caja' | 'Malla' | 'Kilo Directo' | string;
export type MonedaCosto = 'COP' | 'USD' | 'VES';
export type TipoTasaCosto = 'bcv' | 'paralelo' | 'proveedor' | 'personalizada' | string;
export type CategoriaRubro = 'Hortalizas' | 'Frutas' | 'Tubérculos' | 'Aliños' | 'Víveres' | 'Otros' | string;
export type TipoFormulaCosteo = 'formula_csv_usdt' | 'formula_feria_3factores' | 'margen_porcentaje' | 'formula_personalizada';

export interface CategoriaDef {
  id: string;
  nombre: string;
  icono: string;
  color?: string;
  esPersonalizada?: boolean;
}

export interface TasaPersonalizadaDef {
  id: string;
  nombre: string;         // Ej. "Tasa Camión La Grita", "Dólar Mayorista", "Tasa Don Pedro"
  valor: number;          // Ej. 91.50, 3150, 76.50
  tipo?: 'bs_por_dolar' | 'cop_por_dolar' | 'factor_divisor' | 'bs_por_cop';
  icono?: string;         // Emoji representativo
  descripcion?: string;
  esSistema?: boolean;    // true para tasas fijas base
}

export type OperadorPasoFormula = 'div' | 'mul' | 'add' | 'sub' | 'percent_add' | 'percent_sub' | 'none';

export type VariableEntradaFormula =
  | 'costo_origen_empaque'       // 🔄 [Costo Origen Bulto] - Moneda nativa del rubro (COP, USD o VES)
  | 'costo_origen_kilo'          // 🔄 [Costo Origen Kilo] - Moneda nativa del rubro por kilo
  | 'costo_bulto_cop'            // 🇨🇴 [Costo Bulto COP] - Costo total en Pesos
  | 'costo_kilo_cop'             // 🇨🇴 [Costo Kilo COP] - Costo por kilo en Pesos
  | 'costo_bulto_ves'            // 🇻🇪 [Costo Bulto Bs.] - Costo total en Bolívares
  | 'costo_kilo_ves'             // 🇻🇪 [Costo Kilo Bs.] - Costo por kilo en Bolívares
  | 'costo_bulto_usd'            // 🇺🇸 [Costo Bulto USD Base] - Dólar base / efectivo
  | 'costo_kilo_usd'             // 🇺🇸 [Costo Kilo USD Base] - Dólar base por kilo
  | 'costo_bulto_usd_bcv'        // 🇻🇪 [Costo Bulto USD @ BCV] - Dólar valorado a Tasa BCV
  | 'costo_kilo_usd_bcv'         // 🇻🇪 [Costo Kilo USD @ BCV] - Dólar valorado a Tasa BCV
  | 'costo_bulto_usd_paralelo'   // 📈 [Costo Bulto USD @ Paralelo] - Dólar a Tasa Paralelo / Monitor
  | 'costo_kilo_usd_paralelo'    // 📈 [Costo Kilo USD @ Paralelo] - Dólar a Tasa Paralelo / Monitor
  | 'costo_bulto_usd_proveedor'  // 🤝 [Costo Bulto USD @ Proveedor] - Dólar a Tasa Proveedor / Reposición
  | 'costo_kilo_usd_proveedor'   // 🤝 [Costo Kilo USD @ Proveedor] - Dólar a Tasa Proveedor / Reposición
  | 'precio_base_usdt';          // 📊 [Precio Base CSV USDT] - Valor de matriz CSV

export type TipoValorPaso =
  | 'manual'
  | 'tasa_bcv'
  | 'tasa_paralelo'
  | 'tasa_proveedor'
  | 'tasa_cop'
  | 'divisor_cop_usdt'
  | 'factor_margen'
  | 'tasa_divisa_bcv'
  | 'tasa_usdt'
  | string; // Para admitir cualquier ID de tasa personalizada creada por el usuario

export type MonedaSalidaFormula = 'VES' | 'USD' | 'COP';

export interface PasoFormulaCustom {
  id: string;
  nombre?: string;
  op: OperadorPasoFormula;
  val: number; // Permite 0, 1, 3.2, 785, 3150, 0.000365, etc.
  tipoValor?: TipoValorPaso; // 'manual' o ID de una tasa del sistema / personalizada
  tasaId?: string;           // ID de la tasa personalizada vinculada
  activo: boolean;
}

export interface FormulaPersonalizadaCosteo {
  variableEntrada?: VariableEntradaFormula; // Default: 'costo_origen_empaque' o 'costo_bulto_cop'
  monedaResultado?: MonedaSalidaFormula;    // 'VES' (Bs. BCV), 'USD' ($ Dólares), 'COP' (Pesos)
  pasos?: PasoFormulaCustom[];              // Pasos dinámicos del constructor total

  // Compatibilidad directa con 3 pasos
  op1?: OperadorPasoFormula;
  val1?: number;
  op2?: OperadorPasoFormula;
  val2?: number;
  op3?: OperadorPasoFormula;
  val3?: number;
}

export type EstrategiaFormulaItem = 'heredar_global' | TipoFormulaCosteo;

export interface ItemCosteo {
  id: string;
  nombre: string;
  categoria: CategoriaRubro;
  icono: string;
  tipoEmpaque: TipoEmpaque;
  pesoEmpaqueKg: number;        // Ej. 45 Kg para Saco de Papa, 22 Kg para Cesta de Tomate
  monedaCosto: MonedaCosto;      // 'COP' | 'USD' | 'VES'
  costoEmpaque: number;          // Costo de compra del bulto (ej. 90.000 COP, 25 USD o 1.800 VES)
  tipoTasaCosto?: TipoTasaCosto; // 'bcv' | 'paralelo' | 'proveedor' | 'personalizada' | ID de tasa personalizada
  tasaCompraPersonalizada?: number; // Tasa específica de compra pactada para este rubro (ej. 92.00 Bs/$)
  tasaPersonalizadaId?: string;  // ID de la tasa personalizada seleccionada
  fleteUnitario: number;         // Costo de transporte/flete por bulto (en USD o moneda costo)
  mermaPorcentaje: number;       // % de pérdida por merma/descarte (ej. 5%)
  margenPorcentaje: number;      // % de ganancia deseado al detal (ej. 30%)
  margenMayoristaPorcentaje?: number; // % de ganancia al mayor (ej. 15%)
  precioBaseUSDT?: number;       // Precio base en USDT del archivo CSV (ej. 1.50 Tomate)
  
  // Fijación directa y personalizada de precio para la Pizarra
  modoPrecioPizarra?: 'automatico' | 'manual_usd' | 'manual_ves'; // Modo activo de fijación
  precioManualFijadoUSD?: number; // Precio fijado directamente en Dólares ($/Kg)
  precioManualFijadoVES?: number; // Precio fijado directamente en Bolívares (Bs/Kg)
  
  // Soporte para fórmula matemática personalizada exclusiva por rubro
  tipoFormulaItem?: EstrategiaFormulaItem;              // 'heredar_global' | 'formula_personalizada' | etc.
  formulaPersonalizadaItem?: FormulaPersonalizadaCosteo; // Pasos matemáticos exclusivos para este rubro específico
  
  // Soporte para actividades, servicios y rubros personalizados
  esServicio?: boolean;          // True si es un servicio/actividad (flete, empaquetado, calibrado, mano de obra)
  codigoSku?: string;            // Código interno o de barra
  descripcion?: string;          // Descripción o notas del rubro/servicio
  proveedor?: string;
  fechaActualizacion?: string;
}

export interface ItemCosteoCalculado extends ItemCosteo {
  // Kilos y Costos
  kilosNetosAprovechables: number;
  costoTotalEmpaqueUSD: number;
  costoTotalEmpaqueVES: number;
  costoTotalEmpaqueCOP: number;
  costoKiloUSD: number;
  costoKiloVES: number;
  costoKiloCOP: number;

  // Precios de Venta Sugeridos al Detal
  precioVentaDetalKiloUSD: number;
  precioVentaDetalKiloVES: number;
  precioVentaDetalKiloCOP: number;

  // Precios de Venta al Mayor (por bulto / saco completo)
  precioVentaMayorKiloUSD: number;
  precioVentaMayorKiloVES: number;
  precioVentaMayorEmpaqueUSD: number;
  precioVentaMayorEmpaqueVES: number;

  // Ganancia Proyectada
  gananciaPorKiloUSD: number;
  gananciaPorKiloVES: number;
  gananciaTotalEmpaqueUSD: number;
  gananciaTotalEmpaqueVES: number;
  rentabilidadRealPct: number;
}

export interface TasasCosteo {
  tasaBCV: number;                    // Ej. 76.50 Bs/$
  tasaParalelo?: number;              // Ej. 95.00 Bs/$ (Dólar Paralelo / Monitor / Efectivo)
  tasaProveedor?: number;             // Ej. 92.00 Bs/$ (Tasa Dólar Proveedor / Reposición)
  tasaCOP: number;                    // Ej. 3850 COP/$
  tasaUSDT?: number;                  // Ej. 94.00 Bs/USDT (Cripto P2P)
  tasaCompraCOP_USDT?: number;        // Factor divisor base CSV: ej. 3150 (90.000 COP ÷ 3150 = 28.57 USDT)
  factorMargenCOP?: number;           // Factor margen feria: ej. 880
  tasaDivisaBCV?: number;             // Factor divisor divisa feria: ej. 765
  tasasPersonalizadas?: TasaPersonalizadaDef[]; // Lista dinámica de tasas creadas por el usuario
  tipoFormula?: TipoFormulaCosteo;    // Tipo de fórmula activa
  formulaPersonalizada?: FormulaPersonalizadaCosteo; // Configuración de fórmula personalizada
  tipoRedondeoBCV: 'entero' | 'multiplo_5' | 'exacto';
  preciosBaseUSDT?: Record<string, number>; // Precios base del CSV: { Tomate: 1.50, Cebolla: 1.20, Papa: 1.00, etc. }
  fechaActualizacion: string;
}

export type CostingTab = 'hoja_costeo' | 'pizarra_precios' | 'configuracion';
