import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const res = await db.collection('sensorfuentes').updateMany({ activo: false }, { $set: { activo: true } })
console.log(`✅ Activados: ${res.modifiedCount}`)
await client.close()
