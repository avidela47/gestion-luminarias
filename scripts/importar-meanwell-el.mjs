import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('sensorfuentes')

const productos = [
  { codigo: 'XDR-120E-24-EL', stock_actual: 50, precio: 12.30 },
  { codigo: 'XDR-150E-24-EL', stock_actual: 50, precio: 12.80 },
  { codigo: 'XDR-75E-24-EL', stock_actual: 50, precio: 10.60 },
  { codigo: 'MDR-100-24-EL', stock_actual: 50, precio: 20.90 },
  { codigo: 'MDR-20-24-EL', stock_actual: 50, precio: 8.40 },
  { codigo: 'MDR-60-24-EL', stock_actual: 50, precio: 12.10 },
  { codigo: 'XDR-240E-24-EL', stock_actual: 50, precio: 24.20 },
  { codigo: 'XDR-480E-24-EL', stock_actual: 50, precio: 47.20 },
  { codigo: 'XTR-240-24-EL', stock_actual: 50, precio: 37.40 },
  { codigo: 'XTR-480-24-EL', stock_actual: 30, precio: 57.20 },
  { codigo: 'XTR-960-24-EL', stock_actual: 15, precio: 115.00 },
  { codigo: 'LRS-100-12-EL', stock_actual: 50, precio: 9.40 },
  { codigo: 'LRS-100-48-EL', stock_actual: 30, precio: 10.00 },
  { codigo: 'LRS-100-24-EL', stock_actual: 50, precio: 8.90 },
  { codigo: 'LRS-100-5-EL', stock_actual: 50, precio: 11.10 },
  { codigo: 'LRS-150-12-EL', stock_actual: 50, precio: 11.80 },
  { codigo: 'LRS-150F-5-EL', stock_actual: 50, precio: 13.80 },
  { codigo: 'LRS-150-48-EL', stock_actual: 30, precio: 12.60 },
  { codigo: 'LRS-150-24-EL', stock_actual: 50, precio: 11.00 },
  { codigo: 'LRS-200-5-EL', stock_actual: 50, precio: 17.40 },
  { codigo: 'LRS-200-12-EL', stock_actual: 50, precio: 15.50 },
  { codigo: 'LRS-200-48-EL', stock_actual: 30, precio: 16.60 },
  { codigo: 'LRS-200-24-EL', stock_actual: 50, precio: 14.60 },
  { codigo: 'LRS-350-24-EL', stock_actual: 50, precio: 18.60 },
  { codigo: 'LRS-350-12-EL', stock_actual: 50, precio: 19.30 },
  { codigo: 'LRS-350-5-EL', stock_actual: 50, precio: 20.30 },
  { codigo: 'LRS-350-48-EL', stock_actual: 30, precio: 20.70 },
  { codigo: 'LRS-35-12-EL', stock_actual: 50, precio: 6.40 },
  { codigo: 'LRS-35-5-EL', stock_actual: 50, precio: 7.00 },
  { codigo: 'LRS-35-24-EL', stock_actual: 50, precio: 6.30 },
  { codigo: 'LRS-50-24-EL', stock_actual: 50, precio: 6.80 },
  { codigo: 'LRS-50-12-EL', stock_actual: 50, precio: 7.10 },
  { codigo: 'LRS-50-5-EL', stock_actual: 50, precio: 8.00 },
  { codigo: 'LRS-600-12-EL', stock_actual: 50, precio: 35.60 },
  { codigo: 'LRS-600-24-EL', stock_actual: 50, precio: 35.60 },
  { codigo: 'LRS-600-48-EL', stock_actual: 30, precio: 38.10 },
  { codigo: 'LRS-75-5-EL', stock_actual: 50, precio: 9.20 },
  { codigo: 'LRS-75-12-EL', stock_actual: 50, precio: 8.40 },
  { codigo: 'LRS-75-24-EL', stock_actual: 50, precio: 8.00 },
  { codigo: 'LRS-75-48-EL', stock_actual: 30, precio: 9.00 },
]

let insertados = 0
let omitidos = 0

for (const p of productos) {
  const existe = await col.findOne({ codigo: p.codigo })
  if (existe) {
    omitidos++
    continue
  }
  await col.insertOne({
    codigo: p.codigo,
    descripcion: p.codigo.replace('-EL', ''),
    tipo: 'fuente',
    stock_actual: p.stock_actual,
    stock_minimo: 0,
    precio: p.precio,
    proveedor: 'MEAN WELL',
    notas: 'ELUXEN-ITELSA — importado desde proforma',
    foto: '',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  insertados++
}

await client.close()
console.log(`✅ Insertados: ${insertados} | Omitidos: ${omitidos}`)
