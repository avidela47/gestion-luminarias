# Manual de Usuario — Sistema de Gestión ITELSA SAS

**Versión 1.0 — Junio 2026**

---

## Cómo ingresar al sistema

Abrí el navegador y entrá a:
**https://gestion-luminarias.vercel.app**

Ingresá tu usuario y contraseña. Si no tenés usuario, pedíselo al administrador.

---

## Menú lateral

El menú de la izquierda está dividido en secciones. Abajo del logo vas a ver tu nombre de usuario.

---

## PRODUCCIÓN

### Dashboard
Es la pantalla principal. Muestra un resumen de todo:
- Cuántos componentes hay en stock
- Si algún componente está por debajo del mínimo (hay que reponer)
- Cuántas luminarias se fabricaron este mes
- Stock de sensores y fuentes
- Herramientas no disponibles
- Vales pendientes de cierre

Sirve para tener una vista rápida del estado general sin entrar a cada sección.

---

### Componentes
Son los insumos y materiales que se usan para fabricar las luminarias.

**Qué podés hacer:**
- Ver el listado completo con el stock actual de cada uno
- Buscar por código o nombre
- Crear un nuevo componente (botón verde arriba a la derecha)
- Editar un componente existente (ícono lápiz)
- Eliminar un componente (ícono tacho)
- Subir una foto del componente

**Qué significa el color rojo en stock:** el stock actual está por debajo del mínimo — hay que reponer.

---

### Recetas (BOM)
Una receta define qué componentes y en qué cantidad se necesitan para fabricar una luminaria específica.

**Qué podés hacer:**
- Ver todas las recetas activas
- Crear una nueva receta: código, nombre y agregar los componentes con su cantidad
- Editar una receta (si cambiás los componentes, la versión sube automáticamente)
- Ver la **ficha técnica** (ícono hoja): muestra la receta en formato imprimible con foto de cada componente — ideal para que cualquier operario sepa cómo armar la luminaria
- Subir foto del producto terminado

---

### Fabricar
Acá se registra la fabricación de luminarias usando una receta.

**Cómo fabricar:**
1. Seleccioná la luminaria (receta) que vas a fabricar
2. Ingresá la cantidad de unidades
3. Ingresá el nombre del operario
4. Hacé clic en **Fabricar**

El sistema va a verificar que haya stock suficiente de todos los componentes. Si falta algo, te avisa cuál y cuánto falta.

Si hay stock suficiente, descuenta los componentes y suma las unidades fabricadas al stock de luminarias.

---

### Movimientos
Registro de todas las entradas y salidas de componentes.

**Tipos de movimiento:**
- **Entrada por compra:** cuando llega mercadería de un proveedor
- **Salida por producción:** se genera automáticamente cuando fabricás
- **Ajuste manual entrada:** para corregir stock hacia arriba
- **Ajuste manual salida:** para corregir stock hacia abajo

**Cómo registrar una entrada:**
1. Clic en **Nuevo movimiento**
2. Seleccioná el componente
3. Elegí el tipo (entrada por compra)
4. Ingresá la cantidad
5. Guardá

---

### Vales
Son documentos internos para controlar cuando alguien retira materiales, herramientas u otros elementos del depósito.

**Cómo crear un vale:**
1. Clic en **Nuevo vale**
2. Ingresá el nombre del responsable (quien retira)
3. Agregá los ítems: descripción, cantidad y tipo (stock / herramienta / otro)
4. Guardá

**Estados de un vale:**
- **Abierto:** se emitió pero no todo volvió
- **Devolución parcial:** volvió algo pero no todo
- **Cerrado:** todo fue devuelto

**Registrar una devolución:**
1. Buscá el vale en la lista
2. Clic en el ícono ojo (ver)
3. Clic en **Registrar devolución**
4. Ingresá cuánto devuelve de cada ítem
5. Confirmá

El vale se puede imprimir para que firme quien retira y quien entrega.

---

## STOCK

### Sensores y Fuentes
Stock de sensores, fuentes de alimentación y accesorios.

**Qué podés hacer:**
- Ver el listado filtrado por tipo
- Buscar por código o descripción
- Crear, editar y eliminar productos
- **Exportar a Excel** (botón verde con ícono descarga): descarga toda la lista actual en formato Excel

---

### Luminarias
Stock unificado de todos los tipos de luminarias.

**Tipos:**
- **Fabricadas (con receta):** luminarias propias, el stock se actualiza automáticamente al fabricar
- **Comerciales (importadas):** luminarias importadas, stock manual
- **Depósito (nacionales):** luminarias nacionales sin receta, stock manual

Podés filtrar por tipo usando el selector arriba de la tabla.

---

### Herramientas
Inventario de herramientas del taller.

**Estados:**
- **Disponible:** en el depósito lista para usar
- **En uso:** salió con alguien
- **Reparación:** está siendo reparada
- **Baja:** fuera de servicio

**Qué podés hacer:**
- Ver todas las herramientas y su estado
- Crear, editar y eliminar herramientas
- Controlar cuántas hay en total y cuántas están disponibles

---

## COMERCIAL

### Clientes
Base de datos de clientes.

**Qué podés hacer:**
- Ver, crear, editar y eliminar clientes
- Cada cliente tiene: nombre, razón social, CUIT, dirección, teléfono, email y condición de IVA

La condición de IVA es importante porque define si el presupuesto lleva IVA o no.

---

### Proveedores
Base de datos de proveedores de insumos.

**Qué podés hacer:**
- Ver, crear, editar y eliminar proveedores

---

### Presupuestos
Cotizaciones en dólares para los clientes.

**Cómo crear un presupuesto:**
1. Clic en **Nuevo presupuesto**
2. Seleccioná el cliente
3. Completá vendedor, validez y forma de pago
4. Ingresá la cotización del dólar (ej: Dólar BNA Tipo Vendedor)
5. Agregá los ítems: podés buscar en el catálogo (sensores, fuentes, luminarias) o agregar ítems manuales
6. Para cada ítem podés poner el plazo de entrega individual
7. Guardá como **Borrador** o **Enviado**

**Estados:**
- **Borrador:** en preparación
- **Enviado:** mandado al cliente
- **Aprobado:** el cliente aceptó
- **Rechazado:** el cliente no aceptó

Para cambiar el estado: usá el selector en la columna Estado de la tabla de presupuestos.

**Imprimir:** desde la vista del presupuesto (ícono ojo) hay un botón Imprimir.

---

### Órdenes de Trabajo
Se crean cuando un presupuesto fue aprobado y hay que producir para el cliente.

**Cómo crear una OT:**
1. Entrá a Órdenes de Trabajo
2. Clic en **Nueva orden**
3. Vinculala al presupuesto aprobado
4. Completá los datos

**Ejecutar una OT:** descuenta el stock de luminarias del depósito y fabrica la diferencia que falta.

---

### Recibos
Documentos de cobro interno (no son facturas oficiales).

**Cómo crear un recibo:**
1. Clic en **Nuevo recibo**
2. Seleccioná el cliente y vinculalo a la orden de trabajo
3. Agregá las líneas de detalle con descripción y monto
4. Guardá

**Registrar un pago:**
- Desde la vista del recibo podés registrar pagos parciales
- Ingresás el monto, la fecha y el tipo de cambio del día
- El sistema calcula automáticamente el saldo

**Estados:**
- **Pendiente de pago**
- **Pago parcial**
- **Cancelado** (pagado totalmente)

---

### Despachos
Cuando una venta está confirmada y hay que entregar las luminarias, se registra un despacho. Esto descuenta el stock de luminarias.

**Cómo crear un despacho:**
1. Clic en **Nuevo despacho**
2. Seleccioná el cliente
3. Opcionalmente vinculalo a un presupuesto aprobado (carga los ítems automáticamente)
4. Ajustá las cantidades si es necesario
5. Guardá

**Confirmar el despacho:**
- Desde la vista del despacho (ícono ojo), clic en **Confirmar despacho**
- El sistema verifica que haya stock suficiente
- Si hay stock, lo descuenta de las luminarias
- Se puede imprimir con firmas

**Anular un despacho:**
- Si el despacho fue confirmado y hay que revertirlo, clic en **Anular despacho**
- El stock vuelve automáticamente

---

## REPORTES

### Reportes
Gráficos y estadísticas del negocio: producción por mes, luminarias más fabricadas, estado de recibos.

### Auditoría
Solo para administradores. Muestra un registro de todas las acciones realizadas en el sistema: quién creó, editó o eliminó qué y cuándo.

Podés filtrar por usuario, módulo y tipo de acción.

---

## Flujo completo de una venta

```
1. Cargás el CLIENTE
2. Creás el PRESUPUESTO → lo enviás → el cliente aprueba → cambiás el estado a Aprobado
3. Si hay que fabricar → creás ORDEN DE TRABAJO → ejecutás
4. Si ya tenés stock → creás el DESPACHO → confirmás → stock se descuenta
5. Cobrás → creás el RECIBO → registrás los pagos
```

---

## Consejos generales

- **Siempre buscá antes de crear:** usá el buscador para verificar que el cliente, componente o producto no exista ya.
- **Los campos con asterisco (\*) son obligatorios.**
- **El stock se actualiza automáticamente** cuando fabricás o ejecutás una orden. No lo modifiques manualmente salvo para corregir errores.
- **Los presupuestos y recibos se pueden imprimir** directamente desde la pantalla de vista.
- **Si cometés un error**, avisale al administrador — muchas acciones quedan registradas en Auditoría y se pueden corregir.

---

*Sistema de Gestión ITELSA SAS — Desarrollado internamente — 2026*