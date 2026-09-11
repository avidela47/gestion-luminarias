import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
dotenv.config({ path: '.env.local' })
const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const docs = await db.collection('sensorfuentes').find({ tipo: 'fuente' }).toArray()
const sinDesc = docs.filter(d => !d.descripcion || d.descripcion === d.codigo)
console.log(`Sin descripción real: ${sinDesc.length}`)
sinDesc.forEach(d => console.log(d.codigo))
await client.close()
