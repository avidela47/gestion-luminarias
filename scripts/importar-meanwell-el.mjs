import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('sensorfuentes')

const productos = [
  { codigo: 'XDR-120E-24-EL', stock_actual: 50, precio: 12.30, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 5 A, 120W. Con montaje a riel DIN.' },
  { codigo: 'XDR-150E-24-EL', stock_actual: 50, precio: 12.80, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 6,25 A, 150W. Con montaje a riel DIN.' },
  { codigo: 'XDR-75E-24-EL', stock_actual: 50, precio: 10.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 3,15 A, 75,6W. Con montaje a riel DIN.' },
  { codigo: 'MDR-100-24-EL', stock_actual: 50, precio: 20.90, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 4 A, 96W. Con montaje a riel DIN.' },
  { codigo: 'MDR-20-24-EL', stock_actual: 50, precio: 8.40, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 1 A, 24W. Con montaje a riel DIN.' },
  { codigo: 'MDR-60-24-EL', stock_actual: 50, precio: 12.10, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 2,5 A, 60W. Con montaje a riel DIN.' },
  { codigo: 'XDR-240E-24-EL', stock_actual: 50, precio: 24.20, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 10 A, 240W. Con montaje a riel DIN.' },
  { codigo: 'XDR-480E-24-EL', stock_actual: 50, precio: 47.20, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 20 A, 480W. Con montaje a riel DIN.' },
  { codigo: 'XTR-240-24-EL', stock_actual: 50, precio: 37.40, descripcion: 'Fuente de alimentación trifásica. Marca Mean Well. Entrada 340...550 VAC, Salida 24 VDC / 10 A, 240W. Con montaje a riel DIN.' },
  { codigo: 'XTR-480-24-EL', stock_actual: 30, precio: 57.20, descripcion: 'Fuente de alimentación trifásica. Marca Mean Well. Entrada 340...550 VAC, Salida 24 VDC / 20 A, 480W. Con montaje a riel DIN.' },
  { codigo: 'XTR-960-24-EL', stock_actual: 15, precio: 115.00, descripcion: 'Fuente de alimentación trifásica. Marca Mean Well. Entrada 340...550 VAC, Salida 24 VDC / 40 A, 960W. Con montaje a riel DIN.' },
  { codigo: 'LRS-100-12-EL', stock_actual: 50, precio: 9.40, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 12 VDC / 8.5 A, 102W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-100-48-EL', stock_actual: 30, precio: 10.00, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 48 VDC / 2.3 A, 110.4W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-100-24-EL', stock_actual: 50, precio: 8.90, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 4.5 A, 108W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-100-5-EL', stock_actual: 50, precio: 11.10, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 5 VDC / 18 A, 90W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-150-12-EL', stock_actual: 50, precio: 11.80, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...132 VAC / 170...264 VAC (conmutable por llave), Salida 12 VDC / 12.5 A, 150W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-150F-5-EL', stock_actual: 50, precio: 13.80, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada Rango Completo 85...264 VAC, Salida 5 VDC / 22 A, 110W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-150-48-EL', stock_actual: 30, precio: 12.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...132 VAC / 170...264 VAC (conmutable por llave), Salida 48 VDC / 3.3 A, 158.4W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-150-24-EL', stock_actual: 50, precio: 11.00, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...132 VAC / 170...264 VAC (conmutable por llave), Salida 24 VDC / 6.5 A, 156W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-200-5-EL', stock_actual: 50, precio: 17.40, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 5 VDC / 40 A, 200W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-200-12-EL', stock_actual: 50, precio: 15.50, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 12 VDC / 17 A, 204W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-200-48-EL', stock_actual: 30, precio: 16.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 48 VDC / 4.4 A, 211.2W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-200-24-EL', stock_actual: 50, precio: 14.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 24 VDC / 8.8 A, 211.2W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-350-24-EL', stock_actual: 50, precio: 18.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 24 VDC / 14.6 A, 350.4W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-350-12-EL', stock_actual: 50, precio: 19.30, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 12 VDC / 29 A, 348W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-350-5-EL', stock_actual: 50, precio: 20.30, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 5 VDC / 60 A, 300W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-350-48-EL', stock_actual: 30, precio: 20.70, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 48 VDC / 7.3 A, 350.4W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-35-12-EL', stock_actual: 50, precio: 6.40, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 12 VDC / 3 A, 36W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-35-5-EL', stock_actual: 50, precio: 7.00, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 5 VDC / 7 A, 35W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-35-24-EL', stock_actual: 50, precio: 6.30, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 1.5 A, 36W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-50-24-EL', stock_actual: 50, precio: 6.80, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 2.2 A, 52.8W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-50-12-EL', stock_actual: 50, precio: 7.10, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 12 VDC / 4.2 A, 50.4W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-50-5-EL', stock_actual: 50, precio: 8.00, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 5 VDC / 10 A, 50W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-600-12-EL', stock_actual: 50, precio: 35.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC, Salida 12 VDC / 50 A, 600W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-600-24-EL', stock_actual: 50, precio: 35.60, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC, Salida 24 VDC / 25 A, 600W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-600-48-EL', stock_actual: 30, precio: 38.10, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC, Salida 48 VDC / 12.5 A, 600W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-75-5-EL', stock_actual: 50, precio: 9.20, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 5 VDC / 14 A, 70W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-75-12-EL', stock_actual: 50, precio: 8.40, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 12 VDC / 6 A, 72W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-75-24-EL', stock_actual: 50, precio: 8.00, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 3.2 A, 76.8W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-75-48-EL', stock_actual: 30, precio: 9.00, descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 48 VDC / 1.6 A, 76.8W. Formato caja metálica perforada tipo perfil bajo.' },
]

let insertados = 0
let omitidos = 0
let actualizados = 0

for (const p of productos) {
  const existe = await col.findOne({ codigo: p.codigo })
  if (existe) {
    // Actualiza descripcion si ya existe
    await col.updateOne({ codigo: p.codigo }, { $set: { descripcion: p.descripcion, updatedAt: new Date() } })
    actualizados++
    continue
  }
  await col.insertOne({
    codigo: p.codigo,
    descripcion: p.descripcion,
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
console.log(`✅ Insertados: ${insertados} | Actualizados: ${actualizados} | Omitidos: ${omitidos}`)
