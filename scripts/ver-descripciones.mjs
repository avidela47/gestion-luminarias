import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const docs = await db.collection('productoterminados').find({}).limit(2).toArray()
docs.forEach(d => console.log(JSON.stringify(d, null, 2)))
await client.close()
