import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('sensorfuentes')

const docs = await col.find({ codigo: /-EL$/ }).toArray()
console.log(`Encontrados: ${docs.length}`)

let actualizados = 0
for (const doc of docs) {
  if (doc.stock_actual === 0) {
    console.log(`⏭️ ${doc.codigo} — stock 0, se omite`)
    continue
  }
  const nuevoStock = Math.floor(doc.stock_actual / 2)
  await col.updateOne(
    { _id: doc._id },
    { $set: { stock_actual: nuevoStock, updatedAt: new Date() } }
  )
  console.log(`✅ ${doc.codigo}: ${doc.stock_actual} → ${nuevoStock}`)
  actualizados++
}

await client.close()
console.log(`\n✅ Actualizados: ${actualizados}`)
