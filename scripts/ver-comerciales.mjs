import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const doc = await db.collection('luminariacomericals').findOne({})
console.log(JSON.stringify(doc, null, 2))
await client.close()
