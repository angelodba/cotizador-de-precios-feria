export type NavigationTab = 
  | 'indicadores' 
  | 'inventario' 
  | 'pos' 
  | 'reportes' 
  | 'cobranza' 
  | 'configuracion';

export interface ClientDebtor {
  id: string;
  nombre: string;
  cedula?: string;
  telefono?: string;
  direccion?: string;
  deudaVES: number;
  deudaUSD: number;
  fechaRegistro: string;
  historial: Array<{
    id: string;
    fecha: string;
    concepto: string;
    montoVES: number;
    montoUSD: number;
    tipo: 'cargo' | 'abono';
  }>;
}

export interface SaleRecord {
  id: string;
  fecha: string;
  itemsCount: number;
  totalVES: number;
  totalUSD: number;
  metodoPago: 'Pagomovil' | 'Cash USD' | 'Cash VES' | 'Punto de Venta' | 'Zelle' | 'USDT' | 'COP' | 'Mixto';
  detalles?: string;
}
