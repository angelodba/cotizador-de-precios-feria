-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL PARA COTIZADOR DE PRECIOS & COSTEO FERIA
-- Compatible con Supabase (Copia y pega este script en el SQL Editor de Supabase)
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Rubros e Insumos de Costeo
CREATE TABLE IF NOT EXISTS public.items_costeo (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    icono TEXT DEFAULT '🥬',
    tipo_empaque TEXT DEFAULT 'Saco',
    peso_empaque_kg NUMERIC(10, 2) NOT NULL DEFAULT 45.00,
    moneda_costo TEXT NOT NULL DEFAULT 'COP', -- 'COP', 'USD', 'VES'
    costo_empaque NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    tipo_tasa_costo TEXT DEFAULT 'bcv',       -- 'bcv', 'paralelo', 'proveedor', 'personalizada'
    tasa_compra_personalizada NUMERIC(12, 2),
    flete_unitario NUMERIC(10, 2) DEFAULT 0.50,
    merma_porcentaje NUMERIC(5, 2) DEFAULT 5.00,
    margen_porcentaje NUMERIC(5, 2) DEFAULT 30.00,
    margen_mayorista_porcentaje NUMERIC(5, 2) DEFAULT 15.00,
    precio_base_usdt NUMERIC(10, 2),
    tipo_formula_item TEXT,
    formula_personalizada_item JSONB,         -- Pasos de la fórmula exclusiva del rubro
    es_servicio BOOLEAN DEFAULT FALSE,
    codigo_sku TEXT,
    descripcion TEXT,
    proveedor TEXT,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Configuración Global de Tasas y Fórmulas
CREATE TABLE IF NOT EXISTS public.configuracion_tasas (
    id TEXT PRIMARY KEY DEFAULT 'current_rates',
    tasa_bcv NUMERIC(12, 2) NOT NULL DEFAULT 76.50,
    tasa_paralelo NUMERIC(12, 2) DEFAULT 95.00,
    tasa_proveedor NUMERIC(12, 2) DEFAULT 92.00,
    tasa_usdt NUMERIC(12, 2) DEFAULT 94.00,
    tasa_cop NUMERIC(12, 2) NOT NULL DEFAULT 3850.00,
    tasa_compra_cop_usdt NUMERIC(12, 2) DEFAULT 3150.00,
    factor_margen_cop NUMERIC(12, 2) DEFAULT 880.00,
    tasa_divisa_bcv NUMERIC(12, 2) DEFAULT 765.00,
    tipo_formula TEXT DEFAULT 'formula_csv_usdt',   -- Estrategia activa: 'formula_csv_usdt', 'formula_feria_3factores', 'margen_porcentaje', 'formula_personalizada'
    tasas_personalizadas JSONB DEFAULT '[]'::jsonb, -- Array de tasas creadas por el usuario
    formula_global JSONB,                          -- Configuración del Constructor Total
    tipo_redondeo_bcv TEXT DEFAULT 'entero',
    precios_base_usdt JSONB,                       -- Precios de referencia de la matriz
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.configuracion_tasas ADD COLUMN IF NOT EXISTS tipo_formula TEXT DEFAULT 'formula_csv_usdt';

-- 4. Tabla de Categorías Personalizadas
CREATE TABLE IF NOT EXISTS public.categorias_rubro (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    icono TEXT DEFAULT '🏷️',
    es_personalizada BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla de Cotizaciones y Ventas Realizadas
CREATE TABLE IF NOT EXISTS public.cotizaciones_ventas (
    id TEXT PRIMARY KEY,
    numero_ticket TEXT,
    cliente_nombre TEXT,
    cliente_telefono TEXT,
    moneda_cobro TEXT NOT NULL,                    -- 'VES', 'USD', 'COP'
    tasa_bcv_aplicada NUMERIC(12, 2) NOT NULL,
    total_usd NUMERIC(14, 2) NOT NULL,
    total_ves NUMERIC(16, 2) NOT NULL,
    total_cop NUMERIC(16, 2) NOT NULL,
    items JSONB NOT NULL,                          -- Detalle de los rubros cotizados
    notas TEXT,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Habilitar Realtime para suscripciones en vivo (WebSocket)
ALTER PUBLICATION supabase_realtime ADD TABLE items_costeo;
ALTER PUBLICATION supabase_realtime ADD TABLE configuracion_tasas;

-- 7. Deshabilitar RLS o habilitar acceso público para la clave anon
ALTER TABLE items_costeo ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_tasas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_rubro ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones_ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total a items_costeo" ON items_costeo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a configuracion_tasas" ON configuracion_tasas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a categorias_rubro" ON categorias_rubro FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a cotizaciones_ventas" ON cotizaciones_ventas FOR ALL USING (true) WITH CHECK (true);

-- Fin del script
