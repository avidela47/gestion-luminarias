import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')

// Estos son los codigos que en el Excel original tenian stock 0
const conStockCero = [
  'LRS-100-5', 'LRS-200-5', 'LRS-350-5', 'LRS-50-5',
  'MDR-100-24', 'MDR-60-24', 'XTR-960-24'
]

for (const codigo of conStockCero) {
  const doc = await db.collection('sensorfuentes').findOne({ codigo })
  if (doc) console.log(`${codigo}: stock actual = ${doc.stock_actual}`)
}

await client.close()
