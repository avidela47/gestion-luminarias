# ITELSA SAS — Sistema de Gestión de Luminarias
## Documentación técnica v1.0.0

---

## Stack tecnológico
- **Frontend + API:** Next.js 14 (App Router) — Vercel
- **Base de datos:** MongoDB Atlas
- **Auth:** NextAuth.js v5 (beta) con Credentials
- **UI:** Tailwind CSS + shadcn/ui + lucide-react
- **Estilos:** CSS Variables en globals.css

---

## URLs
- **Producción:** https://gestion-luminarias.vercel.app
- **Local:** http://localhost:3000
- **Repositorio:** https://github.com/avidela47/gestion-luminarias

---

## Credenciales (NO compartir)
- **Usuario app:** admin
- **Contraseña app:** itelsa2026
- Las credenciales de MongoDB Atlas y los secrets están en Vercel → Settings → Environment Variables

---

## Variables de entorno
```env
MONGODB_URI=           # String de conexión MongoDB Atlas
NEXTAUTH_SECRET=       # Secret para JWT
NEXTAUTH_URL=          # URL base (localhost en dev, vercel en prod)
AUTH_SECRET=           # Secret para NextAuth v5
AUTH_USERNAME=         # Usuario de acceso
AUTH_PASSWORD=         # Contraseña de acceso
```

---

## Estructura del proyecto

gestion-luminarias/
├── app/
│   ├── (app)/                    # Layout con sidebar (rutas protegidas)
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── componentes/          # CRUD componentes + ModalComponente
│   │   ├── recetas/              # CRUD recetas (BOM) + ModalReceta
│   │   ├── fabricar/             # Pantalla de producción propia
│   │   ├── movimientos/          # Historial + ModalMovimiento
│   │   ├── clientes/             # CRUD clientes + ModalCliente
│   │   ├── proveedores/          # CRUD proveedores + ModalProveedor
│   │   ├── productos/            # CRUD producto terminado + ModalProducto
│   │   ├── presupuestos/         # CRUD + vista impresión + editar
│   │   ├── ordenes/              # CRUD + ejecución + impresión
│   │   ├── recibos/              # CRUD + pagos parciales + impresión
│   │   └── reportes/             # Dashboard de reportes
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Handler NextAuth
│   │   ├── componentes/          # GET, POST + [id] GET, PUT, DELETE
│   │   ├── recetas/              # GET, POST + [id] GET, PUT, DELETE
│   │   ├── producciones/         # GET, POST (descuenta stock)
│   │   ├── movimientos/          # GET, POST
│   │   ├── clientes/             # GET, POST + [id] GET, PUT, DELETE
│   │   ├── proveedores/          # GET, POST + [id] GET, PUT, DELETE
│   │   ├── productos/            # GET, POST + [id] GET, PUT, DELETE
│   │   ├── presupuestos/         # GET, POST + [id] GET, PUT, DELETE
│   │   ├── ordenes/              # GET, POST + [id] GET, PUT, DELETE
│   │   │   └── [id]/ejecutar/    # POST — ejecuta la OT
│   │   ├── recibos/              # GET, POST + [id] GET, PUT, DELETE
│   │   │   └── [id]/pago/        # POST — registra un pago
│   │   ├── dashboard/            # GET — datos del dashboard
│   │   └── reportes/             # GET — datos de reportes
│   └── login/                    # Pantalla de login
├── components/
│   ├── Sidebar.tsx               # Menú lateral con navegación
│   └── ui/                       # Componentes shadcn/ui
├── models/
│   ├── Componente.ts             # Stock de insumos
│   ├── Receta.ts                 # BOM por luminaria
│   ├── Produccion.ts             # Historial de fabricación
│   ├── Movimiento.ts             # Log de entradas/salidas
│   ├── Cliente.ts                # Cartera de clientes
│   ├── Proveedor.ts              # Proveedores de insumos
│   ├── ProductoTerminado.ts      # Stock de luminarias listas
│   ├── Presupuesto.ts            # Cotizaciones a clientes
│   ├── OrdenTrabajo.ts           # Producción para cliente
│   └── Recibo.ts                 # Cobros con pagos parciales
├── lib/
│   ├── db/mongoose.ts            # Conexión MongoDB con cache
│   └── constants.ts              # Datos de ITELSA SAS
├── auth.ts                       # Configuración NextAuth v5
├── proxy.ts                      # Protección de rutas (reemplaza middleware)
└── public/
└── logo.png                  # Logo ITELSA

Modelos de datos
Componente
Insumos y materiales con stock actual, mínimo, proveedor, precio y ubicación.
Campo foto disponible para cuando se active la carga de imágenes.
Receta (BOM)
Define los componentes y cantidades que lleva cada luminaria.
Tiene versionado automático — si cambiás los componentes, sube la versión.
Produccion
Registra cada lote fabricado. Al crear una producción, el sistema valida
el stock y descuenta automáticamente los componentes.
Movimiento
Log completo de todas las entradas y salidas de stock.
Tipos: entrada_compra, salida_produccion, ajuste_manual_entrada, ajuste_manual_salida.
Presupuesto
Cotización en dólares. Líneas con código, descripción, cantidad, bonificación y precio.
IVA automático según condición IVA del cliente (21% para Responsable Inscripto).
Estados: Borrador → Enviado → Aprobado → Rechazado.
OrdenTrabajo
Producción vinculada a un cliente y presupuesto.
Cada línea tiene cantidad total, cantidad desde depósito y cantidad a fabricar.
Al ejecutar: descuenta ProductoTerminado del depósito y fabrica lo restante
descontando componentes. El estado lo maneja el usuario manualmente.
Recibo
Documento de cobro interno (no fiscal).
Soporta pagos parciales con tipo de cambio del día.
Calcula automáticamente total pagado, saldo y cambia estado:
Pendiente de pago → Pago parcial → Cancelado.

Flujo principal del negocio
Cliente solicita luminarias
        │
        ▼
PRESUPUESTO (cotización en U$S, con IVA automático)
        │ estado: Aprobado
        ▼
ORDEN DE TRABAJO
 ├── Toma stock de ProductoTerminado (depósito)
 └── Fabrica lo que falta (descuenta componentes)
        │
        ▼
RECIBO (cobro en U$S con conversión a pesos del día)
        │
        ▼
Cancelado (pagado total)

FABRICAR (paralelo, producción propia para stock)
 └── Descuenta componentes → suma a ProductoTerminado

Datos de la empresa (constants.ts)
typescriptEMPRESA = {
  razon_social: 'ITELSA SAS',
  domicilio: 'Bv. Cristóbal Berritella 7365',
  localidad: 'Córdoba',
  provincia: 'Córdoba',
  cuit: '30-71630098-2',
  telefono: '+54 9 3517 33 1063',
  condicion_iva: 'RESPONSABLE INSCRIPTO',
  vendedor_default: 'ARIEL VIDELA',
}

Pendiente — Imágenes
Las fotos de componentes y producto terminado están planificadas.
El campo foto (string con URL) ya existe en los modelos.
Implementación pendiente: subida de archivos al VPS vía endpoint,
servido por Nginx desde /uploads/. Activar en formularios cuando
el sistema esté estable en producción.

Comandos útiles
bash# Desarrollo local
npm run dev

# Build producción
npm run build

# Deploy (automático al hacer push a master)
git push origin master

Notas importantes

El archivo proxy.ts reemplaza middleware.ts (deprecado en Next.js 16)
En desarrollo usar NEXTAUTH_URL=http://localhost:3000
En producción NEXTAUTH_URL=https://gestion-luminarias.vercel.app (configurado en Vercel)
El .env.local NUNCA se sube a GitHub (está en .gitignore)
Para limpiar datos de prueba: ir a MongoDB Atlas → Browse Collections → borrar documentos (no colecciones)

