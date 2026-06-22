# Checklist de Testeo — Sistema ITELSA SAS

Probá cada paso en orden. Si algo falla, anotá **qué paso** y **qué pasó**.

---

## Circuito A — Producción (llenar depósito)

- [ ] **Componente:** crear uno nuevo → aparece en la lista
- [ ] **Componente:** editar → guarda el cambio
- [ ] **Movimiento:** cargar entrada de stock a un componente → el stock sube
- [ ] **Receta:** crear una con varios componentes → aparece
- [ ] **Receta:** ver ficha técnica imprimible → muestra fotos
- [ ] **Fabricar:** fabricar una luminaria con receta → dice "registrada"
- [ ] **Luminarias:** la fabricada aparece en filtro "Fabricadas (con receta)" con el stock correcto
- [ ] **Componentes:** el stock de los componentes usados bajó

---

## Stock manual

- [ ] **Luminaria comercial (importada):** crear con stock → aparece en filtro "Comerciales"
- [ ] **Luminaria depósito (nacional):** crear con stock → aparece en filtro "Depósito"
- [ ] **Sensores:** crear uno → aparece
- [ ] **Sensores:** exportar a Excel → descarga el archivo
- [ ] **Herramienta:** crear una → aparece con su estado

---

## Circuito B — Venta (de punta a punta)

- [ ] **Cliente:** crear uno de prueba → aparece
- [ ] **Presupuesto:** crear, agregar ítems del catálogo, guardar
- [ ] **Presupuesto:** cambiar estado a "Aprobado" → queda guardado
- [ ] **Presupuesto:** imprimir → se ve con membrete ITELSA
- [ ] **Orden de Trabajo:** crear desde el presupuesto aprobado
- [ ] **Orden de Trabajo:** ejecutar → descuenta depósito + aparece cartel "falta fabricar"
- [ ] **Fabricar:** producir lo que pidió el cartel
- [ ] **Despacho:** crear (vinculado al presupuesto o manual)
- [ ] **Despacho:** confirmar → el stock de luminarias BAJA
- [ ] **Despacho:** anular → el stock de luminarias VUELVE
- [ ] **Recibo:** crear con líneas de detalle
- [ ] **Recibo:** registrar un pago parcial → calcula el saldo

---

## Control interno

- [ ] **Vale:** crear con varios ítems → aparece como "Abierto"
- [ ] **Vale:** registrar devolución parcial → pasa a "Devolución parcial"
- [ ] **Vale:** devolver todo → pasa a "Cerrado"
- [ ] **Vale:** imprimir → se ve con firmas

---

## Reversiones (que el stock vuelva)

- [ ] **Eliminar luminaria fabricada:** los componentes vuelven al stock
- [ ] **Anular despacho:** el stock de luminarias vuelve

---

## Administración

- [ ] **Dashboard:** todos los números coinciden con la realidad
- [ ] **Auditoría:** cada acción de arriba quedó registrada con tu usuario
- [ ] **Auditoría:** filtrar por usuario / módulo / acción → funciona

---

## Multiusuario (antes de que entre la gente)

- [ ] Crear un usuario nuevo desde Registro
- [ ] Entrar con ese usuario → su nombre aparece en el sidebar
- [ ] Hacer una acción con ese usuario → queda en Auditoría con SU nombre

---

**Si los marcaste todos → el sistema está listo para producción.**

*Cualquier paso que falle: anotá el número y qué pasó, y se corrige puntual.*
-----