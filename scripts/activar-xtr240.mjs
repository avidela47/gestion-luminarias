import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
await db.collection('sensorfuentes').updateOne({ codigo: 'XTR-240-24' }, { $set: { activo: true } })
console.log('✅ Activado')
await client.close()
