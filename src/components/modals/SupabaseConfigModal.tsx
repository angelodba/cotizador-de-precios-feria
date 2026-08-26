import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Database,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  HardDrive,
  Copy,
  ExternalLink,
  UploadCloud
} from 'lucide-react';
import { getSupabaseConfig, setSupabaseConfig, testSupabaseConnection } from '../../services/supabaseClient';
import { syncService, type SyncStatusInfo } from '../../services/syncService';
import { db } from '../../db/costingDb';
import type { ItemCosteo, TasasCosteo, CategoriaDef } from '../../types/costing';
import { downloadFileMobile, hapticFeedback } from '../../utils/mobileUtils';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: (data: { items: ItemCosteo[]; tasas: TasasCosteo; categorias: CategoriaDef[] }) => void;
  onShowToast: (msg: string) => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onShowToast
}) => {
  const [url, setUrl] = useState<string>('');
  const [anonKey, setAnonKey] = useState<string>('');
  const [testing, setTesting] = useState<boolean>(false);
  const [pushing, setPushing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusInfo>(syncService.getStatus());
  const [activeTab, setActiveTab] = useState<'cloud' | 'backup' | 'sql'>('cloud');

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
      setSyncStatus(syncService.getStatus());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = syncService.subscribeStatus(s => setSyncStatus(s));
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);
  };

  const handleSaveConfig = async () => {
    setSupabaseConfig(url, anonKey);
    await syncService.init();
    onShowToast('💾 Configuración de Supabase guardada.');
    onClose();
  };

  const handleManualSync = async () => {
    await syncService.processQueueAndSync();
    onShowToast('🔄 Sincronización con la nube ejecutada.');
  };

  const handlePushAllToCloud = async () => {
    setPushing(true);
    setSupabaseConfig(url, anonKey);
    const res = await syncService.pushAllLocalDataToCloud();
    setPushing(false);
    if (res.success) {
      onShowToast(`☁️ ${res.message}`);
    } else {
      onShowToast(`❌ ${res.message}`);
    }
  };

  const handleExportBackup = async () => {
    hapticFeedback('light');
    try {
      const jsonStr = await db.exportBackupJSON();
      const fileName = `respaldo_feria_costeo_${new Date().toISOString().slice(0, 10)}.json`;
      downloadFileMobile(jsonStr, fileName, 'application/json');
      hapticFeedback('success');
      onShowToast('📥 Respaldo local JSON descargado exitosamente.');
    } catch (e: any) {
      onShowToast(`❌ Error al exportar respaldo: ${e.message}`);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const restored = await db.importBackupJSON(text);
      if (onDataRestored) {
        onDataRestored(restored);
      }
      onShowToast('✅ Copia de seguridad restaurada correctamente.');
      onClose();
    } catch (err: any) {
      onShowToast(`❌ Error al restaurar respaldo: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 my-auto animate-fade-in text-gray-900 dark:text-white max-h-[92vh] max-h-[92dvh] overflow-y-auto touch-scroll">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Base de Datos & Cloud
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                IndexedDB (Offline) + Supabase (Nube)
              </p>
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

        {/* Estado Actual de la Base de Datos */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#131b2e] dark:to-[#0f172a] border border-blue-200 dark:border-blue-900/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-3 h-3 rounded-full shrink-0 ${
              syncStatus.state === 'online_synced'
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse'
                : syncStatus.state === 'syncing'
                  ? 'bg-blue-500 animate-spin'
                  : syncStatus.state === 'offline_queued'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
            }`} />
            <div className="min-w-0">
              <div className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>{syncStatus.message}</span>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                {syncStatus.lastSyncTime ? `Última sincronización: ${syncStatus.lastSyncTime}` : 'Almacenamiento local activo en IndexedDB'}
                {syncStatus.pendingChangesCount > 0 && ` (${syncStatus.pendingChangesCount} cambios pendientes en cola)`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            <RefreshCw size={12} className={syncStatus.state === 'syncing' ? 'animate-spin' : ''} />
            <span>Sincronizar</span>
          </button>
        </div>

        {/* Pestañas del Modal */}
        <div className="flex bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cloud' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <Cloud size={14} />
            <span>Supabase Cloud</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'backup' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <HardDrive size={14} />
            <span>Respaldos JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sql' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            <Database size={14} />
            <span>Script SQL</span>
          </button>
        </div>

        {/* Tab 1: Configuración Supabase */}
        {activeTab === 'cloud' && (
          <div className="flex flex-col gap-3 animate-fade-in text-xs sm:text-sm">
            <div className="bg-gray-50 dark:bg-[#131b2e] p-3 rounded-xl border border-gray-200 dark:border-slate-800">
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                Conecta tu proyecto gratuito de <strong>Supabase</strong> para respaldar tus costos y sincronizar tus precios en tiempo real entre tu teléfono, tablet y computadora.
              </p>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Project URL de Supabase</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-slate-200 mb-1 block">Anon / Public API Key</label>
              <input
                type="password"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full bg-gray-50 dark:bg-[#131b2e] border border-gray-300 dark:border-slate-700 rounded-xl p-2.5 font-mono text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs font-bold ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/60 border-red-300 text-red-800 dark:text-red-200'
              }`}>
                {testResult.success ? <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url.trim()}
                className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
                <span>{testing ? 'Probando...' : 'Probar Conexión'}</span>
              </button>

              <button
                type="button"
                onClick={handlePushAllToCloud}
                disabled={pushing || !url.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                title="Sube todo el catálogo actual de IndexedDB a Supabase"
              >
                <UploadCloud size={14} className={pushing ? 'animate-spin' : ''} />
                <span>{pushing ? 'Subiendo...' : 'Subir a Supabase'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer text-center"
              >
                Guardar y Conectar
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Respaldos Locales JSON */}
        {activeTab === 'backup' && (
          <div className="flex flex-col gap-3.5 animate-fade-in text-xs sm:text-sm">
            <div className="bg-gray-50 dark:bg-[#131b2e] p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col gap-1.5">
              <span className="font-extrabold text-gray-900 dark:text-white">Copia de Seguridad Local</span>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Descarga un archivo JSON completo con todos tus rubros, fórmulas, tasas de cambio y cotizaciones para guardarlo en tu computadora o enviarlo por WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-xs flex flex-col items-center justify-center gap-2 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                <Download size={20} />
                <span>Descargar Copia JSON</span>
              </button>

              <label className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-black text-xs flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-all cursor-pointer text-center">
                <Upload size={20} />
                <span>Restaurar desde JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Script SQL para Supabase */}
        {activeTab === 'sql' && (
          <div className="flex flex-col gap-3 animate-fade-in text-xs">
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Para inicializar las tablas en PostgreSQL, copia este script y pégalo en el <strong>SQL Editor</strong> de tu panel de Supabase:
            </p>

            <div className="relative bg-gray-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto border border-gray-800">
              <pre>{`-- Tabla de Rubros e Insumos
CREATE TABLE IF NOT EXISTS public.items_costeo (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    icono TEXT DEFAULT '🥬',
    tipo_empaque TEXT DEFAULT 'Saco',
    peso_empaque_kg NUMERIC(10, 2) NOT NULL,
    moneda_costo TEXT NOT NULL DEFAULT 'COP',
    costo_empaque NUMERIC(14, 2) NOT NULL,
    tipo_tasa_costo TEXT DEFAULT 'bcv',
    tasa_compra_personalizada NUMERIC(12, 2),
    flete_unitario NUMERIC(10, 2) DEFAULT 0.50,
    merma_porcentaje NUMERIC(5, 2) DEFAULT 5.00,
    margen_porcentaje NUMERIC(5, 2) DEFAULT 30.00,
    margen_mayorista_porcentaje NUMERIC(5, 2) DEFAULT 15.00,
    precio_base_usdt NUMERIC(10, 2),
    tipo_formula_item TEXT,
    formula_personalizada_item JSONB,
    es_servicio BOOLEAN DEFAULT FALSE,
    codigo_sku TEXT,
    descripcion TEXT,
    proveedor TEXT,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Configuración de Tasas
CREATE TABLE IF NOT EXISTS public.configuracion_tasas (
    id TEXT PRIMARY KEY DEFAULT 'current_rates',
    tasa_bcv NUMERIC(12, 2) NOT NULL,
    tasa_paralelo NUMERIC(12, 2),
    tasa_proveedor NUMERIC(12, 2),
    tasa_usdt NUMERIC(12, 2),
    tasa_cop NUMERIC(12, 2) NOT NULL,
    tasa_compra_cop_usdt NUMERIC(12, 2),
    factor_margen_cop NUMERIC(12, 2),
    tasa_divisa_bcv NUMERIC(12, 2),
    tipo_formula TEXT DEFAULT 'formula_csv_usdt',
    tasas_personalizadas JSONB,
    formula_global JSONB,
    tipo_redondeo_bcv TEXT,
    precios_base_usdt JSONB,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.configuracion_tasas ADD COLUMN IF NOT EXISTS tipo_formula TEXT DEFAULT 'formula_csv_usdt';

ALTER PUBLICATION supabase_realtime ADD TABLE items_costeo;
ALTER PUBLICATION supabase_realtime ADD TABLE configuracion_tasas;`}</pre>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`-- Tabla de Rubros e Insumos
CREATE TABLE IF NOT EXISTS public.items_costeo (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    icono TEXT DEFAULT '🥬',
    tipo_empaque TEXT DEFAULT 'Saco',
    peso_empaque_kg NUMERIC(10, 2) NOT NULL,
    moneda_costo TEXT NOT NULL DEFAULT 'COP',
    costo_empaque NUMERIC(14, 2) NOT NULL,
    tipo_tasa_costo TEXT DEFAULT 'bcv',
    tasa_compra_personalizada NUMERIC(12, 2),
    flete_unitario NUMERIC(10, 2) DEFAULT 0.50,
    merma_porcentaje NUMERIC(5, 2) DEFAULT 5.00,
    margen_porcentaje NUMERIC(5, 2) DEFAULT 30.00,
    margen_mayorista_porcentaje NUMERIC(5, 2) DEFAULT 15.00,
    precio_base_usdt NUMERIC(10, 2),
    tipo_formula_item TEXT,
    formula_personalizada_item JSONB,
    es_servicio BOOLEAN DEFAULT FALSE,
    codigo_sku TEXT,
    descripcion TEXT,
    proveedor TEXT,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.configuracion_tasas (
    id TEXT PRIMARY KEY DEFAULT 'current_rates',
    tasa_bcv NUMERIC(12, 2) NOT NULL,
    tasa_paralelo NUMERIC(12, 2),
    tasa_proveedor NUMERIC(12, 2),
    tasa_usdt NUMERIC(12, 2),
    tasa_cop NUMERIC(12, 2) NOT NULL,
    tasa_compra_cop_usdt NUMERIC(12, 2),
    factor_margen_cop NUMERIC(12, 2),
    tasa_divisa_bcv NUMERIC(12, 2),
    tipo_formula TEXT DEFAULT 'formula_csv_usdt',
    tasas_personalizadas JSONB,
    formula_global JSONB,
    tipo_redondeo_bcv TEXT,
    precios_base_usdt JSONB,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.configuracion_tasas ADD COLUMN IF NOT EXISTS tipo_formula TEXT DEFAULT 'formula_csv_usdt';

ALTER PUBLICATION supabase_realtime ADD TABLE items_costeo;
ALTER PUBLICATION supabase_realtime ADD TABLE configuracion_tasas;`);
                  onShowToast('📋 Script SQL copiado al portapapeles.');
                }}
                className="px-3.5 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy size={13} />
                <span>Copiar SQL</span>
              </button>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs flex items-center gap-1 hover:underline"
              >
                <span>Ir al Dashboard de Supabase</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
