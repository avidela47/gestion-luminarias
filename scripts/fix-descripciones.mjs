import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')

const colecciones = [
  { nombre: 'productoterminados', campo: 'nombre' },
  { nombre: 'luminariacomercials', campo: 'descripcion' },
]

for (const { nombre, campo } of colecciones) {
  const query = { [campo]: /EFIC\. LM\/W/ }
  const docs = await db.collection(nombre).find(query).toArray()
  console.log(`${nombre}: ${docs.length} documentos a actualizar`)
  for (const doc of docs) {
    const nuevoValor = doc[campo].replace(/EFIC\. LM\/W/g, 'EFIC. 160 LM/W')
    await db.collection(nombre).updateOne(
      { _id: doc._id },
      { $set: { [campo]: nuevoValor } }
    )
    console.log(`✅ ${doc.codigo || doc.codigo_luminaria}`)
  }
}

await client.close()
console.log('✅ Listo') 