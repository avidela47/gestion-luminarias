import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('sensorfuentes')

const items = [
  { codigo: 'XDR-120E-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 5 A, 120W. Con montaje a riel DIN.' },
  { codigo: 'XDR-150E-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 6,25 A, 150W. Con montaje a riel DIN.' },
  { codigo: 'XDR-75E-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 3,15 A, 75,6W. Con montaje a riel DIN.' },
  { codigo: 'MDR-20-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 24 VDC / 1 A, 24W. Con montaje a riel DIN.' },
  { codigo: 'XDR-240E-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 10 A, 240W. Con montaje a riel DIN.' },
  { codigo: 'XDR-480E-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...264 VAC / 127...370 VDC, Salida 24 VDC / 20 A, 480W. Con montaje a riel DIN.' },
  { codigo: 'XTR-240-24', descripcion: 'Fuente de alimentación trifásica. Marca Mean Well. Entrada 340...550 VAC, Salida 24 VDC / 10 A, 240W. Con montaje a riel DIN.' },
  { codigo: 'LRS-100-48', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 48 VDC / 2.3 A, 110.4W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-150F-5', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada Rango Completo 85...264 VAC, Salida 5 VDC / 22 A, 110W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-150-48', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...132 VAC / 170...264 VAC (conmutable por llave), Salida 48 VDC / 3.3 A, 158.4W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-200-48', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 48 VDC / 4.4 A, 211.2W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-350-48', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC (conmutable por llave), Salida 48 VDC / 7.3 A, 350.4W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-35-5', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 5 VDC / 7 A, 35W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-600-12', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC, Salida 12 VDC / 50 A, 600W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-600-24', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC, Salida 24 VDC / 25 A, 600W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-600-48', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 90...132 VAC / 180...264 VAC, Salida 48 VDC / 12.5 A, 600W. Formato caja metálica con cooler de ventilación forzada.' },
  { codigo: 'LRS-75-5', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 5 VDC / 14 A, 70W. Formato caja metálica perforada tipo perfil bajo.' },
  { codigo: 'LRS-75-48', descripcion: 'Fuente de alimentación. Marca Mean Well. Entrada 85...264 VAC / 120...370 VDC, Salida 48 VDC / 1.6 A, 76.8W. Formato caja metálica perforada tipo perfil bajo.' },
]

let actualizados = 0
for (const item of items) {
  const res = await col.updateOne(
    { codigo: item.codigo },
    { $set: { descripcion: item.descripcion, updatedAt: new Date() } }
  )
  if (res.modifiedCount > 0) {
    console.log(`✅ ${item.codigo}`)
    actualizados++
  }
}

await client.close()
console.log(`\n✅ Restaurados: ${actualizados}`)
