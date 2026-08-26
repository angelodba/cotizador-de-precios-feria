import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';
import { db } from '../db/costingDb';
import type { ItemCosteo, TasasCosteo, CategoriaDef } from '../types/costing';

export type SyncState = 'local_only' | 'online_synced' | 'syncing' | 'offline_queued' | 'error';

export interface SyncStatusInfo {
  state: SyncState;
  lastSyncTime: string | null;
  pendingChangesCount: number;
  message: string;
}

type SyncListener = (status: SyncStatusInfo) => void;
type RemoteDataListener = (data: { items?: ItemCosteo[]; tasas?: TasasCosteo; categorias?: CategoriaDef[] }) => void;

class SyncService {
  private currentStatus: SyncStatusInfo = {
    state: 'local_only',
    lastSyncTime: null,
    pendingChangesCount: 0,
    message: 'Operando en Modo Local (IndexedDB 100% Offline)'
  };

  private listeners: Set<SyncListener> = new Set();
  private remoteDataListeners: Set<RemoteDataListener> = new Set();
  private realtimeChannel: any = null;
  private isSyncing = false;
  private syncTimeout: any = null;
  private lastLocalPushTimestamp = 0;

  constructor() {
    // Escuchar eventos de conectividad y ciclo de vida de aplicaciones móviles (iOS Safari & Android PWA)
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueueAndSync();
      });

      window.addEventListener('offline', () => {
        this.updateStatus({
          state: 'offline_queued',
          message: 'Sin conexión a internet (Guardando cambios localmente en IndexedDB)'
        });
      });

      // Manejar reconexión cuando la app vuelve del segundo plano en iOS y Android
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleMobileAppResume();
        }
      });

      window.addEventListener('focus', () => {
        this.handleMobileAppResume();
      });

      window.addEventListener('pageshow', () => {
        this.handleMobileAppResume();
      });
    }
  }

  private handleMobileAppResume(): void {
    if (navigator.onLine && getSupabaseConfig().isConfigured) {
      this.setupRealtimeChannel();
      this.processQueueAndSync();
    }
  }

  public subscribeStatus(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => this.listeners.delete(listener);
  }

  public subscribeRemoteData(listener: RemoteDataListener): () => void {
    this.remoteDataListeners.add(listener);
    return () => this.remoteDataListeners.delete(listener);
  }

  private updateStatus(partial: Partial<SyncStatusInfo>) {
    this.currentStatus = { ...this.currentStatus, ...partial };
    this.listeners.forEach(l => l(this.currentStatus));
  }

  public getStatus(): SyncStatusInfo {
    return this.currentStatus;
  }

  /**
   * Encola la sincronización con debounce para evitar saturar la red mientras se escribe o interactúa
   */
  public scheduleSync(delayMs = 600): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.processQueueAndSync();
    }, delayMs);
  }

  /**
   * Inicializa la sincronización y la suscripción en tiempo real
   */
  public async init(): Promise<void> {
    const config = getSupabaseConfig();
    const pending = await db.getPendingSyncItems();

    if (!config.isConfigured) {
      this.updateStatus({
        state: 'local_only',
        pendingChangesCount: pending.length,
        message: 'Modo Local (IndexedDB 100% Offline)'
      });
      return;
    }

    if (!navigator.onLine) {
      this.updateStatus({
        state: 'offline_queued',
        pendingChangesCount: pending.length,
        message: 'Sin conexión a internet (Modo Offline)'
      });
      return;
    }

    try {
      // 1. Si la nube está vacía y hay datos locales, poblar la nube
      const cloudItemsCount = await this.getCloudItemsCount();
      const localItems = await db.items.toArray();

      if (cloudItemsCount === 0 && localItems.length > 0) {
        await this.pushAllLocalDataToCloud();
      } else if (cloudItemsCount > 0) {
        // Traer datos frescos de la nube
        await this.pullAllFromCloud();
      }

      await this.flushQueueToCloud();
      this.setupRealtimeChannel();

      this.updateStatus({
        state: 'online_synced',
        lastSyncTime: new Date().toLocaleTimeString('es-VE'),
        pendingChangesCount: 0,
        message: 'Sincronizado con Supabase Cloud'
      });
    } catch (err: any) {
      console.warn('Aviso en init de Supabase:', err);
    }
  }

  /**
   * Configura las suscripciones en tiempo real con WebSockets de Supabase
   */
  private setupRealtimeChannel() {
    const client = getSupabaseClient();
    if (!client) return;

    if (this.realtimeChannel) {
      client.removeChannel(this.realtimeChannel);
    }

    try {
      this.realtimeChannel = client
        .channel('feria_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'items_costeo' },
          async () => {
            // Ignorar eventos generados por nuestra propia escritura reciente
            if (Date.now() - this.lastLocalPushTimestamp < 2000) return;
            console.log('📡 Cambio detectado en items_costeo desde la nube.');
            await this.pullItemsFromCloud();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'configuracion_tasas' },
          async () => {
            // Ignorar eventos generados por nuestra propia escritura reciente
            if (Date.now() - this.lastLocalPushTimestamp < 2000) return;
            console.log('📡 Cambio detectado en configuracion_tasas desde la nube.');
            await this.pullTasasFromCloud();
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Error configurando realtime de Supabase:', e);
    }
  }

  /**
   * Procesa la cola offline y sincroniza con la nube sin sobreescribir el estado local
   */
  public async processQueueAndSync(): Promise<void> {
    if (this.isSyncing) return;
    const client = getSupabaseClient();
    if (!client || !navigator.onLine) {
      const pending = await db.getPendingSyncItems();
      this.updateStatus({
        state: client ? 'offline_queued' : 'local_only',
        pendingChangesCount: pending.length
      });
      return;
    }

    this.isSyncing = true;
    this.updateStatus({ state: 'syncing', message: 'Sincronizando con PostgreSQL en Supabase...' });

    try {
      this.lastLocalPushTimestamp = Date.now();
      // 1. Vaciar cola de cambios pendientes locales hacia Supabase
      await this.flushQueueToCloud();

      this.updateStatus({
        state: 'online_synced',
        lastSyncTime: new Date().toLocaleTimeString('es-VE'),
        pendingChangesCount: 0,
        message: 'Sincronizado con Supabase Cloud'
      });
    } catch (err: any) {
      console.warn('Aviso en sincronización:', err);
      const pending = await db.getPendingSyncItems();
      this.updateStatus({
        state: pending.length > 0 ? 'offline_queued' : 'online_synced',
        pendingChangesCount: pending.length,
        message: err?.message || 'Error en sincronización'
      });
    } finally {
      this.isSyncing = false;
    }
  }

  private async getCloudItemsCount(): Promise<number> {
    const client = getSupabaseClient();
    if (!client) return 0;
    try {
      const { count, error } = await client.from('items_costeo').select('id', { count: 'exact', head: true });
      if (error) return 0;
      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Sube todos los datos de IndexedDB a Supabase
   */
  public async pushAllLocalDataToCloud(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Cliente de Supabase no configurado.' };
    }

    try {
      const localItems = await db.items.toArray();
      const localTasas = await db.tasas.get('current_rates');
      const localCats = await db.categorias.toArray();

      // 1. Subir rubros
      if (localItems.length > 0) {
        const payload = localItems.map(item => ({
          id: item.id,
          nombre: item.nombre,
          categoria: item.categoria,
          icono: item.icono,
          tipo_empaque: item.tipoEmpaque,
          peso_empaque_kg: item.pesoEmpaqueKg,
          moneda_costo: item.monedaCosto,
          costo_empaque: item.costoEmpaque,
          tipo_tasa_costo: item.tipoTasaCosto,
          tasa_compra_personalizada: item.tasaCompraPersonalizada,
          flete_unitario: item.fleteUnitario,
          merma_porcentaje: item.mermaPorcentaje,
          margen_porcentaje: item.margenPorcentaje,
          margen_mayorista_porcentaje: item.margenMayoristaPorcentaje,
          precio_base_usdt: item.precioBaseUSDT,
          tipo_formula_item: item.tipoFormulaItem,
          formula_personalizada_item: item.formulaPersonalizadaItem,
          es_servicio: item.esServicio,
          codigo_sku: item.codigoSku,
          proveedor: item.proveedor,
          fecha_actualizacion: item.fechaActualizacion || new Date().toISOString()
        }));
        await client.from('items_costeo').upsert(payload);
      }

      // 2. Subir tasas
      if (localTasas) {
        const formulaGlobalPayload = {
          ...(localTasas.formulaPersonalizada || {}),
          tipoFormula: localTasas.tipoFormula || 'formula_csv_usdt'
        };
        await client.from('configuracion_tasas').upsert({
          id: 'current_rates',
          tasa_bcv: localTasas.tasaBCV,
          tasa_paralelo: localTasas.tasaParalelo,
          tasa_proveedor: localTasas.tasaProveedor,
          tasa_usdt: localTasas.tasaUSDT,
          tasa_cop: localTasas.tasaCOP,
          tasa_compra_cop_usdt: localTasas.tasaCompraCOP_USDT,
          factor_margen_cop: localTasas.factorMargenCOP,
          tasa_divisa_bcv: localTasas.tasaDivisaBCV,
          tasas_personalizadas: localTasas.tasasPersonalizadas,
          formula_global: formulaGlobalPayload,
          tipo_redondeo_bcv: localTasas.tipoRedondeoBCV,
          precios_base_usdt: localTasas.preciosBaseUSDT,
          fecha_actualizacion: new Date().toISOString()
        });
      }

      // 3. Subir categorías
      if (localCats.length > 0) {
        const catPayload = localCats.map(c => ({
          id: c.id,
          nombre: c.nombre,
          icono: c.icono,
          es_personalizada: c.esPersonalizada ?? false
        }));
        await client.from('categorias_rubro').upsert(catPayload);
      }

      await db.syncQueue.clear();

      this.updateStatus({
        state: 'online_synced',
        lastSyncTime: new Date().toLocaleTimeString('es-VE'),
        pendingChangesCount: 0,
        message: 'Datos locales respaldados exitosamente en Supabase Cloud'
      });

      return { success: true, message: `¡${localItems.length} rubros y tasas subidos a Supabase!` };
    } catch (e: any) {
      return { success: false, message: `Error al subir datos: ${e?.message || e}` };
    }
  }

  /**
   * Envía los cambios locales pendientes a Supabase
   */
  private async flushQueueToCloud(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const queue = await db.getPendingSyncItems();
    if (queue.length === 0) return;

    const processedIds: number[] = [];

    for (const item of queue) {
      try {
        if (item.tabla === 'items_costeo') {
          if (item.accion === 'upsert' && item.payload) {
            await client.from('items_costeo').upsert({
              id: item.payload.id,
              nombre: item.payload.nombre,
              categoria: item.payload.categoria,
              icono: item.payload.icono,
              tipo_empaque: item.payload.tipoEmpaque,
              peso_empaque_kg: item.payload.pesoEmpaqueKg,
              moneda_costo: item.payload.monedaCosto,
              costo_empaque: item.payload.costoEmpaque,
              tipo_tasa_costo: item.payload.tipoTasaCosto,
              tasa_compra_personalizada: item.payload.tasaCompraPersonalizada,
              flete_unitario: item.payload.fleteUnitario,
              merma_porcentaje: item.payload.mermaPorcentaje,
              margen_porcentaje: item.payload.margenPorcentaje,
              margen_mayorista_porcentaje: item.payload.margenMayoristaPorcentaje,
              precio_base_usdt: item.payload.precioBaseUSDT,
              tipo_formula_item: item.payload.tipoFormulaItem,
              formula_personalizada_item: item.payload.formulaPersonalizadaItem,
              es_servicio: item.payload.esServicio,
              codigo_sku: item.payload.codigoSku,
              proveedor: item.payload.proveedor,
              fecha_actualizacion: item.payload.fechaActualizacion || new Date().toISOString()
            });
          } else if (item.accion === 'delete') {
            await client.from('items_costeo').delete().eq('id', item.registroId);
          }
        } else if (item.tabla === 'configuracion_tasas') {
          if (item.accion === 'upsert' && item.payload) {
            const formulaGlobalPayload = {
              ...(item.payload.formulaPersonalizada || {}),
              tipoFormula: item.payload.tipoFormula || 'formula_csv_usdt'
            };
            await client.from('configuracion_tasas').upsert({
              id: 'current_rates',
              tasa_bcv: item.payload.tasaBCV,
              tasa_paralelo: item.payload.tasaParalelo,
              tasa_proveedor: item.payload.tasaProveedor,
              tasa_usdt: item.payload.tasaUSDT,
              tasa_cop: item.payload.tasaCOP,
              tasa_compra_cop_usdt: item.payload.tasaCompraCOP_USDT,
              factor_margen_cop: item.payload.factorMargenCOP,
              tasa_divisa_bcv: item.payload.tasaDivisaBCV,
              tasas_personalizadas: item.payload.tasasPersonalizadas,
              formula_global: formulaGlobalPayload,
              tipo_redondeo_bcv: item.payload.tipoRedondeoBCV,
              precios_base_usdt: item.payload.preciosBaseUSDT,
              fecha_actualizacion: new Date().toISOString()
            });
          }
        }
        if (item.id) processedIds.push(item.id);
      } catch (e) {
        console.warn('Error subiendo cambio individual a Supabase:', e);
        break; // Detener en caso de error de red
      }
    }

    if (processedIds.length > 0) {
      await db.clearSyncQueueByIds(processedIds);
    }
  }

  /**
   * Descarga todos los datos de Supabase y los guarda en IndexedDB
   */
  public async pullAllFromCloud(): Promise<void> {
    await this.pullItemsFromCloud();
    await this.pullTasasFromCloud();
  }

  private async pullItemsFromCloud(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    // Si hay cambios locales pendientes en la cola, no sobreescribir con la nube
    const pending = await db.getPendingSyncItems();
    if (pending.some(p => p.tabla === 'items_costeo')) {
      return;
    }

    const { data, error } = await client.from('items_costeo').select('*');
    if (error || !data || data.length === 0) return;

    const mappedItems: ItemCosteo[] = data.map(row => ({
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      icono: row.icono || '🥬',
      tipoEmpaque: row.tipo_empaque || 'Saco',
      pesoEmpaqueKg: Number(row.peso_empaque_kg) || 22,
      monedaCosto: (row.moneda_costo || 'COP') as any,
      costoEmpaque: Number(row.costo_empaque) || 0,
      tipoTasaCosto: row.tipo_tasa_costo || 'bcv',
      tasaCompraPersonalizada: row.tasa_compra_personalizada ? Number(row.tasa_compra_personalizada) : undefined,
      fleteUnitario: Number(row.flete_unitario) || 0,
      mermaPorcentaje: Number(row.merma_porcentaje) || 0,
      margenPorcentaje: Number(row.margen_porcentaje) || 30,
      margenMayoristaPorcentaje: Number(row.margen_mayorista_porcentaje) || 15,
      precioBaseUSDT: row.precio_base_usdt ? Number(row.precio_base_usdt) : undefined,
      tipoFormulaItem: row.tipo_formula_item || undefined,
      formulaPersonalizadaItem: row.formula_personalizada_item || undefined,
      esServicio: !!row.es_servicio,
      codigoSku: row.codigo_sku || undefined,
      proveedor: row.proveedor || undefined,
      fechaActualizacion: row.fecha_actualizacion
    }));

    // Solo actualizar si hay datos válidos y no se pierde información local
    if (mappedItems.length > 0) {
      await db.bulkSaveItems(mappedItems);
      this.remoteDataListeners.forEach(l => l({ items: mappedItems }));
    }
  }

  private async pullTasasFromCloud(): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    // Si hay cambios locales de tasas pendientes en la cola, no sobreescribir con la nube
    const pending = await db.getPendingSyncItems();
    if (pending.some(p => p.tabla === 'configuracion_tasas')) {
      return;
    }

    const { data, error } = await client.from('configuracion_tasas').select('*').eq('id', 'current_rates').single();
    if (error || !data) return;

    const localTasas = await db.tasas.get('current_rates');
    // Si las tasas locales fueron actualizadas más recientemente que la nube, preservar local
    if (localTasas && localTasas.fechaActualizacion && data.fecha_actualizacion) {
      const localDate = new Date(localTasas.fechaActualizacion).getTime();
      const remoteDate = new Date(data.fecha_actualizacion).getTime();
      if (localDate >= remoteDate) {
        return;
      }
    }

    const formulaGlobal = data.formula_global || {};
    const tipoFormula = data.tipo_formula || formulaGlobal.tipoFormula || 'formula_feria_3factores';

    const mappedTasas: TasasCosteo = {
      tasaBCV: Number(data.tasa_bcv) || 76.50,
      tasaParalelo: Number(data.tasa_paralelo) || 95.00,
      tasaProveedor: Number(data.tasa_proveedor) || 92.00,
      tasaUSDT: Number(data.tasa_usdt) || 94.00,
      tasaCOP: Number(data.tasa_cop) || 3850,
      tasaCompraCOP_USDT: Number(data.tasa_compra_cop_usdt) || 3200,
      factorMargenCOP: Number(data.factor_margen_cop) || 880,
      tasaDivisaBCV: Number(data.tasa_divisa_bcv) || 787,
      tipoFormula: tipoFormula,
      tasasPersonalizadas: data.tasas_personalizadas || [],
      formulaPersonalizada: formulaGlobal,
      tipoRedondeoBCV: data.tipo_redondeo_bcv || 'entero',
      preciosBaseUSDT: data.precios_base_usdt || undefined,
      fechaActualizacion: data.fecha_actualizacion || new Date().toISOString()
    };

    await db.saveTasas(mappedTasas);
    this.remoteDataListeners.forEach(l => l({ tasas: mappedTasas }));
  }
}

export const syncService = new SyncService();
