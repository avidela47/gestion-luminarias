import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('luminariacomercials')

const mapeo = [
  { viejo: 'LEDPL-001', nuevo: 'IT-HL23-TA01' },
  { viejo: 'LEDSL-001', nuevo: 'IT-HLDD1616-RGBW' },
  { viejo: 'LEDSL-002', nuevo: 'IT-HLDD1616-3000K' },
  { viejo: 'SECYP',     nuevo: 'IT-SECYP' },
  { viejo: 'PERFR',     nuevo: 'IT-PERFR' },
  { viejo: 'PERFM',     nuevo: 'IT-PERFM' },
  { viejo: 'LEDLL-001', nuevo: 'IT-HLXTD2345F' },
  { viejo: 'LEDLL-002', nuevo: 'IT-HLXTD2219' },
  { viejo: 'LEDPL-002', nuevo: 'IT-HL20-ZC404' },
  { viejo: 'LEDHTL',    nuevo: 'IT-HL19-BZ-5012' },
  { viejo: 'LEDPL-003', nuevo: 'IT-HL20-ZC408' },
  { viejo: 'LEDPTL',    nuevo: 'IT-HL25-DGYA02' },
  { viejo: 'LEDPL-004', nuevo: 'IT-HL25-TK04' },
  { viejo: 'LEDPL-005', nuevo: 'IT-HL25-TK05' },
  { viejo: 'LEDPL-006', nuevo: 'IT-HL25S-TN03' },
  { viejo: 'LEDPL-007', nuevo: 'IT-HL25-TN034' },
  { viejo: 'LEDWW',     nuevo: 'IT-HLXTD18120' },
]

let actualizados = 0
for (const { viejo, nuevo } of mapeo) {
  const res = await col.updateOne(
    { codigo: viejo },
    { $set: { codigo: nuevo, updatedAt: new Date() } }
  )
  if (res.modifiedCount > 0) {
    console.log(`✅ ${viejo} → ${nuevo}`)
    actualizados++
  } else {
    console.log(`⚠️ No encontrado: ${viejo}`)
  }
}

await client.close()
console.log(`\n✅ Actualizados: ${actualizados}`)
