import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')

const colecciones = ['productoterminados', 'luminariacomericals']

for (const col of colecciones) {
  const docs = await db.collection(col).find({ nombre: /EFIC\. LM\/W/ }).toArray()
  console.log(`${col}: ${docs.length} documentos a actualizar`)
  for (const doc of docs) {
    const nuevoNombre = doc.nombre.replace('EFIC. LM/W', 'EFIC. 160 LM/W')
    await db.collection(col).updateOne(
      { _id: doc._id },
      { $set: { nombre: nuevoNombre } }
    )
    console.log(`✅ ${doc.codigo_luminaria}`)
  }
}

await client.close()
console.log('✅ Listo')