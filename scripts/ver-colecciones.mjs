import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const cols = await db.listCollections().toArray()
for (const col of cols) {
  const count = await db.collection(col.name).countDocuments()
  console.log(`${col.name}: ${count}`)
}
await client.close()
