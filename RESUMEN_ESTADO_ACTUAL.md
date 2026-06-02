# ITELSA SAS — Sistema de Gestión — Estado actual v1.1.0

## Stack
- **Next.js 16.2.4** (App Router) — Vercel
- **MongoDB Atlas** — mongoose
- **NextAuth v5 beta** — Credentials (usuario/contraseña en env)
- **Tailwind CSS** + lucide-react
- **proxy.ts** reemplaza middleware.ts (deprecado en Next.js 16)
- `params` debe awaitearse como Promise en rutas API

## URLs
- **Producción:** https://gestion-luminarias.vercel.app
- **Local:** http://localhost:3000
- **Repo:** https://github.com/avidela47/gestion-luminarias
- **Usuario:** admin / **Pass:** itelsa2026

---

## Módulos completados ✅

### PRODUCCIÓN
- **Dashboard** — estadísticas generales
- **Componentes** — CRUD insumos con stock, mínimo, proveedor
- **Recetas (BOM)** — BOM por luminaria con versionado automático
- **Fabricar** — descuenta componentes, suma a ProductoTerminado
- **Movimientos** — log entradas/salidas

### STOCK
- **Sensores y Fuentes** (`/sensores`) — CRUD + filtro por tipo + 597 productos importados desde Excel
  - Tipos: sensor, fuente, acoplamiento_flexible, actuador, espejo, iluminacion, interruptor_actuador, modulo_seguridad, soporte
- **Luminarias** (`/luminarias`) — unifica ProductoTerminado (fabricadas) + LuminariaComercial (importadas de China)
  - Fabricadas: stock automático via Fabricar/OT
  - Comerciales: stock manual

### COMERCIAL
- **Clientes** — CRUD con condición IVA AFIP
- **Proveedores** — CRUD
- **Presupuestos** — cotización U$S, IVA automático 21% RI
  - Numeración: `0001-00010001`
  - Estados: Borrador → Enviado → Aceptado → Cancelado
  - Selector de productos del catálogo (sensores, fuentes, luminarias fabricadas y comerciales)
  - Vista impresión con membrete ITELSA
- **Órdenes de Trabajo** — vinculada a presupuesto Aceptado
  - Ejecutar: descuenta stock depósito + fabrica diferencia
  - Estado manual (Pendiente/En proceso/Completada/Cancelada)
  - Vista impresión con membrete ITELSA
- **Recibos** — cobro interno (no fiscal)
  - Líneas de detalle con descripción y monto individual
  - Pagos parciales con tipo de cambio del día
  - Estados: Pendiente de pago → Pago parcial → Cancelado
  - Editar concepto, líneas y observaciones
  - Observaciones visibles en impresión
  - Vista impresión con membrete ITELSA

### REPORTES
- Dashboard con gráficos: producción por mes, top luminarias, recibos por estado, componentes bajo mínimo

---

## Modelos MongoDB

| Modelo | Colección | Notas |
|--------|-----------|-------|
| Componente | componentes | insumos con stock |
| Receta | recetas | BOM por luminaria |
| Produccion | producciones | historial fabricación |
| Movimiento | movimientos | log stock |
| Cliente | clientes | con condición IVA |
| Proveedor | proveedores | |
| ProductoTerminado | productoterminados | luminarias fabricadas |
| Presupuesto | presupuestos | cotizaciones |
| OrdenTrabajo | ordenestrabajos | producción para cliente |
| Recibo | recibos | cobros con lineas_detalle |
| SensorFuente | sensorefuentes | sensores y fuentes |
| LuminariaComercial | luminariacomericals | luminarias importadas |

---

## APIs disponibles

```
/api/componentes, /api/componentes/[id]
/api/recetas, /api/recetas/[id]
/api/producciones
/api/movimientos
/api/clientes, /api/clientes/[id]
/api/proveedores, /api/proveedores/[id]
/api/productos, /api/productos/[id]           ← ProductoTerminado
/api/presupuestos, /api/presupuestos/[id]
/api/ordenes, /api/ordenes/[id], /api/ordenes/[id]/ejecutar
/api/recibos, /api/recibos/[id], /api/recibos/[id]/pago
/api/sensores, /api/sensores/[id]
/api/luminarias-comerciales, /api/luminarias-comerciales/[id]
/api/dashboard
/api/reportes
/api/auth/[...nextauth]
```

---

## Flujo de negocio

```
PRESUPUESTO (Aceptado)
    ↓
ORDEN DE TRABAJO → ejecutar → descuenta stock + fabrica
    ↓
RECIBO → pagos parciales hasta Cancelado

FABRICAR (paralelo) → stock propio para depósito
```

---

## Datos empresa (lib/constants.ts)

```typescript
EMPRESA = {
  razon_social: 'ITELSA SAS',
  domicilio: 'Bv. Cristóbal Berritella 7365',
  localidad: 'Córdoba',
  provincia: 'Córdoba',
  cuit: '30-71630098-2',
  telefono: '+54 9 3517 33 1063',
  condicion_iva: 'RESPONSABLE INSCRIPTO',
  vendedor_default: 'ARIEL VIDELA',
}
```

---

## Pendientes

- **Imágenes** — campo `foto` ya existe en modelos, falta endpoint de subida al VPS
- **Remito numerado oficial**
- **Factura electrónica AFIP** (wsfe + afip.js)
- **Acceso contador** — rol solo lectura
- **Reporte financiero**
- **Integración ecommerce Vite** (futuro)

---

## Notas técnicas importantes

- `proxy.ts` reemplaza `middleware.ts` (Next.js 16)
- `params` debe awaitearse: `const { id } = await params`
- `useSearchParams()` requiere Suspense boundary
- Error TS módulo no encontrado → `TypeScript: Restart TS Server` en VSCode
- `.env.local` NUNCA sube a GitHub
- En local: `NEXTAUTH_URL=http://localhost:3000`
- En Vercel: `NEXTAUTH_URL=https://gestion-luminarias.vercel.app`
- Importación masiva sensores: `npx tsx scripts/importar-sensores.ts`

---

## Comandos

```bash
npm run dev          # desarrollo local
git add . && git commit -m "mensaje" && git push   # deploy automático a Vercel
```
