import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('componentes')

const docs = await col.find({ precio: { $exists: true } }).toArray()
console.log(`Encontrados: ${docs.length}`)

for (const doc of docs) {
  await col.updateOne(
    { _id: doc._id },
    {
      $set: { precio_unitario: doc.precio },
      $unset: { precio: '' }
    }
  )
}

await client.close()
console.log('✅ Listo')
