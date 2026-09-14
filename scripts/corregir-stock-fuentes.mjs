import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('sensorfuentes')
const fuentes = [
  { codigo: 'APC-35-500', descripcion: 'Fuente Driver LED Mean Well APC-35-500 Corriente Constante', stock_actual: 5 },
  { codigo: 'APV-12-12', descripcion: 'Fuente LED Estanca Mean Well APV-12-12 12V 12W', stock_actual: 5 },
  { codigo: 'APV-16-24', descripcion: 'Fuente LED Estanca Mean Well APV-16-24 24V 16W', stock_actual: 10 },
  { codigo: 'APV-25-12', descripcion: 'Fuente LED Estanca Mean Well APV-25-12 12V 25W', stock_actual: 6 },
  { codigo: 'CEN-75-30', descripcion: 'Fuente de Alimentación Mean Well CEN-75-30 30V 75W', stock_actual: 1 },
  { codigo: 'DDR-60L-24', descripcion: 'Fuente Riel DIN Mean Well DDR-60L-24 24V 60W', stock_actual: 30 },
  { codigo: 'EDR-120-24', descripcion: 'Fuente Riel DIN Mean Well EDR-120-24 Metalica Slim 24V 5A 120W', stock_actual: 1 },
  { codigo: 'EDR-150-24', descripcion: 'Fuente Riel DIN Mean Well EDR-150-24 Metalica Slim 24V 6.5A 150W', stock_actual: 2 },
  { codigo: 'EDR-75-12', descripcion: 'Fuente Riel DIN Mean Well EDR-75-12 Metalica Slim 12V 6.3A 75W', stock_actual: 1 },
  { codigo: 'EDR-75-24', descripcion: 'Fuente Riel DIN Mean Well EDR-75-24 Metalica Slim 24V 3.2A 75W', stock_actual: 1 },
  { codigo: 'HDR-15-5', descripcion: 'Fuente Riel DIN Ultra Delgada Mean Well HDR-15-5', stock_actual: 0 },
  { codigo: 'HDR-30-24', descripcion: 'Fuente Riel DIN Ultra Delgada Mean Well HDR-30-24', stock_actual: 0 },
  { codigo: 'LPC-35-1050', descripcion: 'Fuente Driver LED Mean Well LPC-35-1050 Corriente Constante', stock_actual: 6 },
  { codigo: 'LPV-100-12', descripcion: 'Fuente LED Estanca Mean Well LPV-100-12 12V 100W', stock_actual: 56 },
  { codigo: 'LPV-100-24', descripcion: 'Fuente LED Estanca Mean Well LPV-100-24 24V 100W', stock_actual: 14 },
  { codigo: 'LPV-150-12', descripcion: 'Fuente LED Estanca Mean Well LPV-150-12 12V 150W', stock_actual: 18 },
  { codigo: 'LPV-20-12', descripcion: 'Fuente LED Estanca Mean Well LPV-20-12 12V 20W', stock_actual: 0 },
  { codigo: 'LPV-35-12', descripcion: 'Fuente LED Estanca Mean Well LPV-35-12 12V 35W', stock_actual: 24 },
  { codigo: 'LPV-60-12', descripcion: 'Fuente LED Estanca Mean Well LPV-60-12 12V 60W', stock_actual: 38 },
  { codigo: 'LRS-100-12', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-100-12 12V 100W', stock_actual: 416 },
  { codigo: 'LRS-100-24', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-100-24 24V 100W', stock_actual: 184 },
  { codigo: 'LRS-100-5', descripcion: 'Fuente Switching Industrial Mean Well LRS-100-5 5V 18A 90W', stock_actual: 0 },
  { codigo: 'LRS-150-12', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-150-12 12V 150W', stock_actual: 109 },
  { codigo: 'LRS-150-15', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-150-15 15V 150W', stock_actual: 6 },
  { codigo: 'LRS-150-24', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-150-24 24V 150W', stock_actual: 64 },
  { codigo: 'LRS-200-12', descripcion: 'Fuente Switching Industrial Mean Well LRS-200-12 12V 200W', stock_actual: 25 },
  { codigo: 'LRS-200-24', descripcion: 'Fuente Switching Industrial Mean Well LRS-200-24 24V 200W', stock_actual: 36 },
  { codigo: 'LRS-200-5', descripcion: 'Fuente Switching Industrial Mean Well LRS-200-5 5V 40A 200W', stock_actual: 0 },
  { codigo: 'LRS-35-12', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-35-12 12V 3A 35W', stock_actual: 97 },
  { codigo: 'LRS-35-24', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-35-24 24V 1.5A 35W', stock_actual: 82 },
  { codigo: 'LRS-350-12', descripcion: 'Fuente Switching Industrial Mean Well LRS-350-12 12V 29A 350W', stock_actual: 65 },
  { codigo: 'LRS-350-24', descripcion: 'Fuente Switching Industrial Mean Well LRS-350-24 24V 14.6A 350W', stock_actual: 191 },
  { codigo: 'LRS-350-5', descripcion: 'Fuente Switching Industrial Mean Well LRS-350-5 5V 60A 300W', stock_actual: 2 },
  { codigo: 'LRS-50-12', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-50-12 12V 4.2A 50W', stock_actual: 59 },
  { codigo: 'LRS-50-24', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-50-24 24V 2.2A 50W', stock_actual: 20 },
  { codigo: 'LRS-50-5', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-50-5 5V 10A 50W', stock_actual: 0 },
  { codigo: 'LRS-75-12', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-75-12 12V 6A 75W', stock_actual: 2 },
  { codigo: 'LRS-75-24', descripcion: 'Fuente Switching Industrial Slim Mean Well LRS-75-24 24V 3.2A 75W', stock_actual: 215 },
  { codigo: 'MDR-100-12', descripcion: 'Fuente Riel DIN Mean Well MDR-100-12 12V 90W', stock_actual: 0 },
  { codigo: 'MDR-100-24', descripcion: 'Fuente Riel DIN Mean Well MDR-100-24 24V 96W', stock_actual: 5 },
  { codigo: 'MDR-60-12', descripcion: 'Fuente Riel DIN Mean Well MDR-60-12 12V 5A 60W', stock_actual: 0 },
  { codigo: 'MDR-60-24', descripcion: 'Fuente Riel DIN Mean Well MDR-60-24 24V 60W', stock_actual: 0 },
  { codigo: 'NDR-240-24', descripcion: 'Fuente Riel DIN Mean Well NDR-240-24 24V 10A 240W', stock_actual: 0 },
  { codigo: 'NDR-240-48', descripcion: 'Fuente Riel DIN Mean Well NDR-240-48 48V 5A 240W', stock_actual: 3 },
  { codigo: 'NDR-480-24', descripcion: 'Fuente Riel DIN Mean Well NDR-480-24 24V 20A 480W', stock_actual: 1 },
  { codigo: 'NDR-480-48', descripcion: 'Fuente Riel DIN Mean Well NDR-480-48 48V 10A 480W', stock_actual: 10 },
  { codigo: 'NDR-75-24', descripcion: 'Fuente Riel DIN Mean Well NDR-75-24 24V 3.2A 75W', stock_actual: 1 },
  { codigo: 'NFM-05-5', descripcion: 'Fuente de Alimentacion Medica Encapsulada Mean Well NFM-05-5 5V 5W', stock_actual: 110 },
  { codigo: 'PCD-16-700B', descripcion: 'Fuente Driver LED Mean Well PCD-16-700B Corriente Constante', stock_actual: 2 },
  { codigo: 'RS-15-12', descripcion: 'Fuente Switching Industrial Mean Well RS-15-12 12V 1.3A 15W', stock_actual: 1 },
  { codigo: 'RSP-1600-48', descripcion: 'Fuente Switching Industrial de Alta Potencia Mean Well RSP-1600-48 48V 1600W', stock_actual: 0 },
  { codigo: 'RSP-200-24', descripcion: 'Fuente Switching Industrial con PFC Mean Well RSP-200-24 24V 200W', stock_actual: 1 },
  { codigo: 'RSP-320-24', descripcion: 'Fuente Switching Industrial con PFC Mean Well RSP-320-24 24V 320W', stock_actual: 1 },
  { codigo: 'RSP-500-24', descripcion: 'Fuente Switching Industrial con PFC Mean Well RSP-500-24 24V 500W', stock_actual: 2 },
  { codigo: 'RSP-3000-48', descripcion: 'Fuente Switching Industrial Mean Well RSP-3000-48 3000W 48V 62.5A', stock_actual: 0 },
  { codigo: 'SD-25B-12', descripcion: 'Convertidor DC/DC Industrial Mean Well SD-25B-12 24V 12V 25W', stock_actual: 0 },
  { codigo: 'SD-25B-5', descripcion: 'Convertidor DC/DC Industrial Mean Well SD-25B-5 24V 5V 25W', stock_actual: 1 },
  { codigo: 'SD-25C-24', descripcion: 'Convertidor DC/DC Industrial Mean Well SD-25C-24 72V 24V 25W', stock_actual: 1 },
  { codigo: 'SD-350B-24', descripcion: 'Convertidor DC/DC Industrial Mean Well SD-350B-24 36V 24V 350W', stock_actual: 4 },
  { codigo: 'SDR-480P-48', descripcion: 'Fuente Riel DIN Mean Well SDR-480P-48 Paralelizable 48V 10A 480W', stock_actual: 1 },
  { codigo: 'XTR-480-24', descripcion: 'Fuente de Alimentacion Conmutada Trifasica Tipo Riel DIN Mean Well XTR-480-24', stock_actual: 3 },
  { codigo: 'XTR-960-24', descripcion: 'Fuente Riel DIN Mean Well XTR-960-24', stock_actual: 0 },
]
let actualizados = 0
let insertados = 0
for (const f of fuentes) {
  const existe = await col.findOne({ codigo: f.codigo })
  if (existe) {
    await col.updateOne({ codigo: f.codigo }, { $set: { descripcion: f.descripcion, stock_actual: f.stock_actual, tipo: 'fuente', proveedor: 'Mean Well', activo: true, updatedAt: new Date() } })
    console.log(`✅ ${f.codigo}: stock=${f.stock_actual}`)
    actualizados++
  } else {
    await col.insertOne({ codigo: f.codigo, descripcion: f.descripcion, tipo: 'fuente', stock_actual: f.stock_actual, stock_minimo: 0, precio: 0, proveedor: 'Mean Well', notas: '', foto: '', activo: true, createdAt: new Date(), updatedAt: new Date() })
    console.log(`➕ ${f.codigo}: insertado stock=${f.stock_actual}`)
    insertados++
  }
}
await client.close()
console.log(`\n✅ Actualizados: ${actualizados} | Insertados: ${insertados}`)
