import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'feria_supabase_url';
const STORAGE_KEY_KEY = 'feria_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let currentConfigKey = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  const url = (storedUrl || envUrl).trim();
  const anonKey = (storedKey || envKey).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http'))
  };
}

export function setSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (cleanUrl) {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (cleanKey) {
    localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
  } else {
    localStorage.removeItem(STORAGE_KEY_KEY);
  }

  cachedClient = null;
  currentConfigKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  const key = `${config.url}_${config.anonKey}`;
  if (cachedClient && currentConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    currentConfigKey = key;
    return cachedClient;
  } catch (err) {
    console.warn('Error inicializando cliente de Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const targetUrl = (url || getSupabaseConfig().url).trim();
    const targetKey = (anonKey || getSupabaseConfig().anonKey).trim();

    if (!targetUrl || !targetKey) {
      return { success: false, message: 'URL o Clave Anon vacías.' };
    }

    const testClient = createClient(targetUrl, targetKey);
    const { error } = await testClient.from('items_costeo').select('id').limit(1);

    if (error) {
      // Si la tabla aún no existe o hay error de RLS, pero la conexión HTTP a Supabase respondió
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Conectado con éxito a Supabase. Nota: La tabla "items_costeo" aún no ha sido creada con el script SQL.'
        };
      }
      return { success: false, message: `Error Supabase (${error.code}): ${error.message}` };
    }

    return { success: true, message: '¡Conexión exitosa a PostgreSQL en Supabase!' };
  } catch (err: any) {
    return { success: false, message: `Error de red o conexión: ${err?.message || err}` };
  }
}
