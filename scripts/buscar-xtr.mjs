import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const docs = await db.collection('sensorfuentes').find({ codigo: /XTR/i }).toArray()
docs.forEach(d => console.log(d.codigo, '- stock:', d.stock_actual))
await client.close()
