import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')

const codigos = [
  'LEDPL-001', 'LEDSL-001', 'LEDSL-002', 'SECYP', 'PERFR', 'PERFM',
  'LEDLL-001', 'LEDLL-002', 'LEDPL-002', 'LEDHTL', 'LEDPL-003',
  'LEDPTL', 'LEDPL-004', 'LEDPL-005', 'LEDPL-006', 'LEDPL-007', 'LEDWW'
]

const productos = [
  { codigo: 'LEDPL-001', descripcion: 'LED projection light', stock_actual: 10, precio: 26.00 },
  { codigo: 'LEDSL-001', descripcion: 'LED strip light', stock_actual: 250, precio: 13.00 },
  { codigo: 'LEDSL-002', descripcion: 'LED strip light', stock_actual: 10, precio: 8.50 },
  { codigo: 'SECYP', descripcion: 'SET END CAP Y PLUG', stock_actual: 100, precio: 0.20 },
  { codigo: 'PERFR', descripcion: 'PERFIL RIGIDO', stock_actual: 250, precio: 1.50 },
  { codigo: 'PERFM', descripcion: 'PERFIL MOLDEABLE', stock_actual: 100, precio: 1.80 },
  { codigo: 'LEDLL-001', descripcion: 'LED linear light', stock_actual: 2, precio: 14.50 },
  { codigo: 'LEDLL-002', descripcion: 'LED linear light', stock_actual: 2, precio: 13.50 },
  { codigo: 'LEDPL-002', descripcion: 'LED projection light', stock_actual: 2, precio: 255.00 },
  { codigo: 'LEDHTL', descripcion: 'LED hug tree lamp', stock_actual: 2, precio: 240.00 },
  { codigo: 'LEDPL-003', descripcion: 'LED projection light', stock_actual: 2, precio: 295.00 },
  { codigo: 'LEDPTL', descripcion: 'LED point light', stock_actual: 2, precio: 12.00 },
  { codigo: 'LEDPL-004', descripcion: 'LED projection light', stock_actual: 8, precio: 95.00 },
  { codigo: 'LEDPL-005', descripcion: 'LED projection light', stock_actual: 3, precio: 148.00 },
  { codigo: 'LEDPL-006', descripcion: 'LED projection light', stock_actual: 6, precio: 82.00 },
  { codigo: 'LEDPL-007', descripcion: 'LED projection light', stock_actual: 6, precio: 102.00 },
  { codigo: 'LEDWW', descripcion: 'LED wall washer', stock_actual: 2, precio: 46.00 },
]

// Borrar de componentes
const del = await db.collection('componentes').deleteMany({ id_componente: { $in: codigos } })
console.log(`🗑️ Eliminados de componentes: ${del.deletedCount}`)

// Insertar en luminariacomercials
let insertados = 0
for (const p of productos) {
  const existe = await db.collection('luminariacomercials').findOne({ codigo: p.codigo })
  if (existe) continue
  await db.collection('luminariacomercials').insertOne({
    codigo: p.codigo,
    descripcion: p.descripcion,
    stock_actual: p.stock_actual,
    stock_minimo: 0,
    precio: p.precio,
    proveedor: 'Guangdong Honglin',
    notas: '',
    foto: '',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  insertados++
}

await client.close()
console.log(`✅ Insertados en luminarias comerciales: ${insertados}`)
