import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const res = await db.collection('sensorfuentes').updateMany(
  { tipo: 'fuente' },
  { $set: { proveedor: 'Mean Well', updatedAt: new Date() } }
)
console.log(`✅ Actualizados: ${res.modifiedCount}`)
await client.close()
