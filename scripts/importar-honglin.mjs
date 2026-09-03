import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('componentes')

const productos = [
  { id_componente: 'LEDPL-001', nombre: 'LED projection light', stock_actual: 10, precio: 26.00 },
  { id_componente: 'LEDSL-001', nombre: 'LED strip light', stock_actual: 250, precio: 13.00 },
  { id_componente: 'LEDSL-002', nombre: 'LED strip light', stock_actual: 10, precio: 8.50 },
  { id_componente: 'SECYP', nombre: 'SET END CAP Y PLUG', stock_actual: 100, precio: 0.20 },
  { id_componente: 'PERFR', nombre: 'PERFIL RIGIDO', stock_actual: 250, precio: 1.50 },
  { id_componente: 'PERFM', nombre: 'PERFIL MOLDEABLE', stock_actual: 100, precio: 1.80 },
  { id_componente: 'LEDLL-001', nombre: 'LED linear light', stock_actual: 2, precio: 14.50 },
  { id_componente: 'LEDLL-002', nombre: 'LED linear light', stock_actual: 2, precio: 13.50 },
  { id_componente: 'LEDPL-002', nombre: 'LED projection light', stock_actual: 2, precio: 255.00 },
  { id_componente: 'LEDHTL', nombre: 'LED hug tree lamp', stock_actual: 2, precio: 240.00 },
  { id_componente: 'LEDPL-003', nombre: 'LED projection light', stock_actual: 2, precio: 295.00 },
  { id_componente: 'LEDPTL', nombre: 'LED point light', stock_actual: 2, precio: 12.00 },
  { id_componente: 'LEDPL-004', nombre: 'LED projection light', stock_actual: 8, precio: 95.00 },
  { id_componente: 'LEDPL-005', nombre: 'LED projection light', stock_actual: 3, precio: 148.00 },
  { id_componente: 'LEDPL-006', nombre: 'LED projection light', stock_actual: 6, precio: 82.00 },
  { id_componente: 'LEDPL-007', nombre: 'LED projection light', stock_actual: 6, precio: 102.00 },
  { id_componente: 'LEDWW', nombre: 'LED wall washer', stock_actual: 2, precio: 46.00 },
]

let insertados = 0
let omitidos = 0

for (const p of productos) {
  const existe = await col.findOne({ id_componente: p.id_componente })
  if (existe) { omitidos++; continue }
  await col.insertOne({
    id_componente: p.id_componente,
    nombre: p.nombre,
    stock_actual: p.stock_actual,
    stock_minimo: 0,
    precio: p.precio,
    proveedor: 'Guangdong Honglin',
    ubicacion: '',
    notas: '',
    foto: '',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  insertados++
}

await client.close()
console.log(`✅ Insertados: ${insertados} | Omitidos: ${omitidos}`)
