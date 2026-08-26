# 🧺 Cotizador de Precios y Simulador Multimoneda - Feria Los Cafeteros

Proyecto independiente para cotización y simulación de precios al detal y mayor para la **Feria de Hortalizas Los Cafeteros**.

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```

---

## 🧮 Características Principales

1. **Motor de Fórmulas Dinámicas (Compras en Pesos COP):**
   - Fórmula feria: `[Costo COP] ÷ TasaCompra (3150) × FactorMargen (880) ÷ TasaDivisa (765) = PRECIO FINAL BCV`.
   - Conversión automática a **Precio Referencial Dólar BCV ($/Kg)** y Precio de Venta en COP.
2. **Soporte Multimoneda de Origen (USD / VES / COP):**
   - Compras en Dólares USD (`costo + margen%`).
   - Compras en Bolívares VES (`costo Bs + margen%` $\rightarrow$ divide entre tasa BCV).
3. **Mesa de Cotización POS:**
   - Cálculo automático de peso neto por descuento de **Tara (Kg)**.
   - Descuentos por línea y descuento global porcentual.
   - Cuadrícula táctil de rubros con búsqueda y filtro por categorías.
4. **Modal de Cobro Mixto Multimoneda:**
   - Divide el pago entre Efectivo USD, Zelle, USDT, Pago Móvil / Punto de Venta (Bs.) y Efectivo Pesos (COP).
   - Cálculo automático de vuelto o saldo pendiente.
5. **Compartir en WhatsApp e Impresión Térmica:**
   - Formato listo para enviar directo al cliente por WhatsApp.
   - Formato de impresión térmica de 80mm.
6. **Optimizado para Tablets y Teléfonos Android:**
   - Teclados numéricos directos (`inputMode="decimal"`).
   - Selector de vista móvil/tablet y barra flotante rápida inferior.
