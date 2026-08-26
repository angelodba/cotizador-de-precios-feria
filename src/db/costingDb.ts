import Dexie, { type Table } from 'dexie';
import type { ItemCosteo, TasasCosteo, CategoriaDef } from '../types/costing';
import { INITIAL_COSTING_ITEMS, INITIAL_TASAS_COSTEO, DEFAULT_CATEGORIES } from '../utils/initialCostingData';

export interface CotizacionVentaRecord {
  id: string;
  numeroTicket: string;
  fecha: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  monedaCobro: 'VES' | 'USD' | 'COP';
  tasaBCVAplicada: number;
  totalUSD: number;
  totalVES: number;
  totalCOP: number;
  items: Array<{
    id: string;
    nombre: string;
    icono: string;
    cantidadKg: number;
    precioUnitarioUSD: number;
    precioUnitarioVES: number;
    subtotalUSD: number;
    subtotalVES: number;
  }>;
  notas?: string;
}

export interface SyncQueueRecord {
  id?: number;
  tabla: 'items_costeo' | 'configuracion_tasas' | 'categorias_rubro' | 'cotizaciones_ventas';
  accion: 'upsert' | 'delete';
  registroId: string;
  payload?: any;
  timestamp: string;
}

export interface TasasRecord extends TasasCosteo {
  id: string; // 'current_rates'
}

export class CostingDexieDatabase extends Dexie {
  items!: Table<ItemCosteo, string>;
  tasas!: Table<TasasRecord, string>;
  categorias!: Table<CategoriaDef, string>;
  cotizaciones!: Table<CotizacionVentaRecord, string>;
  syncQueue!: Table<SyncQueueRecord, number>;

  constructor() {
    super('FeriaCostingDB');

    this.version(1).stores({
      items: 'id, nombre, categoria, monedaCosto, tipoTasaCosto, fechaActualizacion',
      tasas: 'id, fechaActualizacion',
      categorias: 'id, nombre, esPersonalizada',
      cotizaciones: 'id, numeroTicket, fecha, clienteNombre, totalUSD, totalVES, totalCOP',
      syncQueue: '++id, tabla, accion, registroId, timestamp'
    });
  }

  /**
   * Inicializa la base de datos IndexedDB con fallback a localStorage para iOS Private Tabs y WebViews
   */
  async initializeDatabase(): Promise<{
    items: ItemCosteo[];
    tasas: TasasCosteo;
    categorias: CategoriaDef[];
  }> {
    try {
      await this.open();

      const itemCount = await this.items.count();
      const tasasCount = await this.tasas.count();
      const categoriasCount = await this.categorias.count();

      // 1. Si la base de datos está vacía, intentar migrar desde localStorage o usar valores iniciales
      if (itemCount === 0) {
        let initialItems: ItemCosteo[] = INITIAL_COSTING_ITEMS;
        try {
          const saved = localStorage.getItem('feria_costing_items');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialItems = parsed;
            }
          }
        } catch (e) {
          console.warn('Aviso leyendo items de localStorage:', e);
        }
        await this.items.bulkPut(initialItems);
      }

      if (tasasCount === 0) {
        let initialTasas: TasasCosteo = INITIAL_TASAS_COSTEO;
        try {
          const saved = localStorage.getItem('feria_costing_tasas');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
              initialTasas = { ...INITIAL_TASAS_COSTEO, ...parsed };
            }
          }
        } catch (e) {
          console.warn('Aviso leyendo tasas de localStorage:', e);
        }
        await this.tasas.put({ id: 'current_rates', ...initialTasas });
      }

      if (categoriasCount === 0) {
        let initialCats: CategoriaDef[] = DEFAULT_CATEGORIES;
        try {
          const saved = localStorage.getItem('feria_costing_custom_categories');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialCats = parsed;
            }
          }
        } catch (e) {
          console.warn('Aviso leyendo categorías de localStorage:', e);
        }
        await this.categorias.bulkPut(initialCats);
      }

      // Retornar datos cargados desde IndexedDB
      const loadedItems = await this.items.toArray();
      const loadedTasasRecord = await this.tasas.get('current_rates');
      const loadedCategories = await this.categorias.toArray();

      return {
        items: loadedItems.length > 0 ? loadedItems : INITIAL_COSTING_ITEMS,
        tasas: loadedTasasRecord ? loadedTasasRecord : INITIAL_TASAS_COSTEO,
        categorias: loadedCategories.length > 0 ? loadedCategories : DEFAULT_CATEGORIES
      };
    } catch (err) {
      console.warn('IndexedDB no disponible (modo privado o restringido), usando fallback localStorage:', err);
      
      // Fallback seguro para navegación privada en Safari iOS
      let fallbackItems: ItemCosteo[] = INITIAL_COSTING_ITEMS;
      let fallbackTasas: TasasCosteo = INITIAL_TASAS_COSTEO;
      let fallbackCats: CategoriaDef[] = DEFAULT_CATEGORIES;

      try {
        const savedItems = localStorage.getItem('feria_costing_items');
        if (savedItems) fallbackItems = JSON.parse(savedItems);

        const savedTasas = localStorage.getItem('feria_costing_tasas');
        if (savedTasas) fallbackTasas = JSON.parse(savedTasas);

        const savedCats = localStorage.getItem('feria_costing_custom_categories');
        if (savedCats) fallbackCats = JSON.parse(savedCats);
      } catch {
        // En caso extremo, usar constantes base
      }

      return {
        items: fallbackItems,
        tasas: fallbackTasas,
        categorias: fallbackCats
      };
    }
  }

  /**
   * Guarda o actualiza un rubro en IndexedDB y lo encola para sincronización
   */
  async saveItem(item: ItemCosteo): Promise<void> {
    const enriched: ItemCosteo = {
      ...item,
      fechaActualizacion: item.fechaActualizacion || new Date().toISOString()
    };
    try {
      await this.items.put(enriched);
      await this.enqueueSync('items_costeo', 'upsert', enriched.id, enriched);
    } catch (e) {
      console.warn('Fallback guardando item en IndexedDB:', e);
    }
  }

  /**
   * Guarda una lista completa de rubros en IndexedDB
   */
  async bulkSaveItems(items: ItemCosteo[]): Promise<void> {
    try {
      await this.items.bulkPut(items);
    } catch (e) {
      console.warn('Fallback bulkSaveItems en IndexedDB:', e);
    }
  }

  /**
   * Elimina un rubro de IndexedDB y registra la eliminación en la cola
   */
  async deleteItem(id: string): Promise<void> {
    try {
      await this.items.delete(id);
      await this.enqueueSync('items_costeo', 'delete', id);
    } catch (e) {
      console.warn('Fallback deleteItem en IndexedDB:', e);
    }
  }

  /**
   * Guarda la configuración de tasas en IndexedDB
   */
  async saveTasas(tasas: TasasCosteo): Promise<void> {
    const record: TasasRecord = {
      ...tasas,
      id: 'current_rates',
      fechaActualizacion: new Date().toISOString()
    };
    try {
      await this.tasas.put(record);
      await this.enqueueSync('configuracion_tasas', 'upsert', 'current_rates', record);
    } catch (e) {
      console.warn('Fallback saveTasas en IndexedDB:', e);
    }
  }

  /**
   * Guarda las categorías en IndexedDB
   */
  async saveCategorias(categorias: CategoriaDef[]): Promise<void> {
    try {
      await this.categorias.clear();
      await this.categorias.bulkPut(categorias);
      await this.enqueueSync('categorias_rubro', 'upsert', 'all_categories', categorias);
    } catch (e) {
      console.warn('Fallback saveCategorias en IndexedDB:', e);
    }
  }

  /**
   * Guarda una cotización o venta generada
   */
  async saveCotizacion(cotizacion: CotizacionVentaRecord): Promise<void> {
    try {
      await this.cotizaciones.put(cotizacion);
      await this.enqueueSync('cotizaciones_ventas', 'upsert', cotizacion.id, cotizacion);
    } catch (e) {
      console.warn('Fallback saveCotizacion en IndexedDB:', e);
    }
  }

  /**
   * Registra una operación en la cola de sincronización offline
   */
  async enqueueSync(
    tabla: SyncQueueRecord['tabla'],
    accion: SyncQueueRecord['accion'],
    registroId: string,
    payload?: any
  ): Promise<void> {
    try {
      await this.syncQueue.add({
        tabla,
        accion,
        registroId,
        payload,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error encolando acción de sincronización:', e);
    }
  }

  /**
   * Obtiene y limpia las acciones pendientes de la cola de sincronización
   */
  async getPendingSyncItems(): Promise<SyncQueueRecord[]> {
    try {
      return await this.syncQueue.toArray();
    } catch {
      return [];
    }
  }

  async clearSyncQueueByIds(ids: number[]): Promise<void> {
    try {
      await this.syncQueue.bulkDelete(ids);
    } catch (e) {
      console.warn('Error limpiando cola de sync:', e);
    }
  }

  /**
   * Exporta toda la base de datos local en formato JSON
   */
  async exportBackupJSON(): Promise<string> {
    let items: ItemCosteo[] = [];
    let tasas: any = null;
    let categorias: CategoriaDef[] = [];
    let cotizaciones: CotizacionVentaRecord[] = [];

    try {
      items = await this.items.toArray();
      tasas = await this.tasas.get('current_rates');
      categorias = await this.categorias.toArray();
      cotizaciones = await this.cotizaciones.toArray();
    } catch {
      // Fallback a localStorage
      try {
        const i = localStorage.getItem('feria_costing_items');
        if (i) items = JSON.parse(i);
        const t = localStorage.getItem('feria_costing_tasas');
        if (t) tasas = JSON.parse(t);
        const c = localStorage.getItem('feria_costing_custom_categories');
        if (c) categorias = JSON.parse(c);
      } catch {}
    }

    const backup = {
      version: 1,
      fechaExportacion: new Date().toISOString(),
      items: items.length > 0 ? items : INITIAL_COSTING_ITEMS,
      tasas: tasas || INITIAL_TASAS_COSTEO,
      categorias: categorias.length > 0 ? categorias : DEFAULT_CATEGORIES,
      cotizaciones
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Importa y restaura una copia de seguridad JSON
   */
  async importBackupJSON(jsonStr: string): Promise<{
    items: ItemCosteo[];
    tasas: TasasCosteo;
    categorias: CategoriaDef[];
  }> {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') {
      throw new Error('El archivo de respaldo no tiene un formato JSON válido.');
    }

    const items = Array.isArray(data.items) ? data.items : INITIAL_COSTING_ITEMS;
    const tasas = data.tasas ? { id: 'current_rates', ...data.tasas } : { id: 'current_rates', ...INITIAL_TASAS_COSTEO };
    const categorias = Array.isArray(data.categorias) ? data.categorias : DEFAULT_CATEGORIES;

    try {
      if (Array.isArray(data.items)) {
        await this.items.clear();
        await this.items.bulkPut(data.items);
      }

      if (data.tasas) {
        await this.tasas.put({ id: 'current_rates', ...data.tasas });
      }

      if (Array.isArray(data.categorias)) {
        await this.categorias.clear();
        await this.categorias.bulkPut(data.categorias);
      }

      if (Array.isArray(data.cotizaciones)) {
        await this.cotizaciones.clear();
        await this.cotizaciones.bulkPut(data.cotizaciones);
      }
    } catch (e) {
      console.warn('Error escribiendo en IndexedDB durante importación (usando fallback):', e);
    }

    // Siempre actualizar localStorage como espejo seguro
    try {
      localStorage.setItem('feria_costing_items', JSON.stringify(items));
      localStorage.setItem('feria_costing_tasas', JSON.stringify(tasas));
      localStorage.setItem('feria_costing_custom_categories', JSON.stringify(categorias));
    } catch {}

    return { items, tasas, categorias };
  }
}

export const db = new CostingDexieDatabase();
