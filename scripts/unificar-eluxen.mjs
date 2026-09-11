import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('sensorfuentes')

const eluxen = await col.find({ codigo: /-EL$/ }).toArray()
console.log(`ELUXEN encontrados: ${eluxen.length}`)

let unificados = 0
let renombrados = 0

for (const el of eluxen) {
  const codigoBase = el.codigo.replace(/-EL$/, '')
  const base = await col.findOne({ codigo: codigoBase })

  if (base) {
    // Tiene par — sumar stock y borrar el -EL
    const nuevoStock = base.stock_actual + el.stock_actual
    await col.updateOne({ _id: base._id }, { $set: { stock_actual: nuevoStock, updatedAt: new Date() } })
    await col.deleteOne({ _id: el._id })
    console.log(`✅ ${codigoBase}: ${base.stock_actual} + ${el.stock_actual} = ${nuevoStock} | borrado ${el.codigo}`)
    unificados++
  } else {
    // No tiene par — renombrar sacando el -EL
    await col.updateOne({ _id: el._id }, { $set: { codigo: codigoBase, updatedAt: new Date() } })
    console.log(`🔄 ${el.codigo} → ${codigoBase}`)
    renombrados++
  }
}

await client.close()
console.log(`\n✅ Unificados: ${unificados} | Renombrados: ${renombrados}`)
