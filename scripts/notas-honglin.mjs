import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config({ path: '.env.local' })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db('gestion-luminarias')
const col = db.collection('luminariacomercials')

const notas = [
  { codigo: 'IT-HL23-TA01', notas: 'Power: 9W · CCT: W/WW (4000K) DMX512 · Chip: OSRAM · Voltage: 220V/CA · Size: W110*L110*H153mm · Angle: 45°/22mm lens · Material: AL + TG IP65' },
  { codigo: 'IT-HLDD1616-RGBW', notas: 'Power: 12W/M · Size: W16*H16*10000mm · Color: RGBW(3000K) · Beam Angle: 110° DMX512 · LEDs: EPISTAR · Voltage: DC24V IP65 · Pkg: 10 metros por rollo' },
  { codigo: 'IT-HLDD1616-3000K', notas: 'Power: 12W/M · Size: W16*H16*10000mm · Color: 3000K · Beam Angle: 110° · LEDs: EPISTAR · Voltage: DC24V IP65 · Pkg: 5 metros por rollo' },
  { codigo: 'IT-SECYP', notas: 'End plugs & end stoppers' },
  { codigo: 'IT-PERFR', notas: 'Rigid Alu Channel, cannot bend · Size: W17.6*H16*L1000mm · Material: AL' },
  { codigo: 'IT-PERFM', notas: 'Silicone LED Channel Profile (For 16*16 LED strip compatible)' },
  { codigo: 'IT-HLXTD2345F', notas: 'Power: 14.4W · CCT: RGBW(4000K) DMX512 · Chip: EPISTAR · Voltage: DC24V · Size: W23*H45*L1000mm · Angle: 110° · Material: AL + PC IP65' },
  { codigo: 'IT-HLXTD2219', notas: 'Power: 14.4W · CCT: RGBW(4000K) DMX512 · Chip: EPISTAR · Voltage: DC24V · Size: W22*H19*L1000mm · Angle: 10*60° · Material: AL + TG IP65' },
  { codigo: 'IT-HL20-ZC404', notas: 'Power: 102W · CCT: RGBW(4000K) DMX512 · Chip: OSRAM · Voltage: AC100-270V · Size: W150*H170*L680mm · Angle: 10°/22mm lens · Material: AL + TG IP65' },
  { codigo: 'IT-HL19-BZ-5012', notas: 'Power: 215W · Size: L610mm W670mm H100mm · CCT: RGBW(4000K) DMX512 OSRAM · Voltage: DC24V · Angle: 10° · Material: AL + TG IP66 · Outlet: Standard 5-core male/female connector' },
  { codigo: 'IT-HL20-ZC408', notas: 'Power: 354W · Size: W340 L520 H280mm · CCT: RGBW(4000K) DMX512 OSRAM · Voltage: AC90-260V · Angle: 45° · Material: AL + TG IP66 · Outlet: Signal 4-core male-female (50cm) / Power 3x0.75mm² rubber cable (1500mm)' },
  { codigo: 'IT-HL25-DGYA02', notas: 'Power: 3W · Size: Φ70 H69mm · CCT: RGBW(4000K) DMX512 OSRAM · Voltage: DC24V · Angle: 120° · Material: AL + PC IP65 · Outlet: Standard 5-core male/female connector' },
  { codigo: 'IT-HL25-TK04', notas: 'Power: 54W · Size: Φ230 H187mm · CCT: RGBW(3000K) DMX512 OSRAM · Voltage: AC90-260V · Angle: 60° · Material: AL + TG IP66 · Outlet: Signal 4-core male-female (50cm) / Power 3x0.75mm² rubber cable (1500mm)' },
  { codigo: 'IT-HL25-TK05', notas: 'Power: 100W · Size: Φ285 H222mm · CCT: RGBW(4000K) DMX512 OSRAM · Voltage: AC90-260V · Angle: 15° · Material: AL + TG IP66 · Outlet: Signal 4-core male-female (50cm) / Power 3x0.75mm² rubber cable (1500mm)' },
  { codigo: 'IT-HL25S-TN03', notas: 'Power: 36W · Size: Φ205 H145mm · CCT: RGBW(3000K) DMX512 OSRAM · Voltage: AC90-260V · Angle: 15° · Material: AL + TG IP66 · Outlet: Signal 4-core male-female (50cm) / Power 3x0.75mm² rubber cable (1500mm)' },
  { codigo: 'IT-HL25-TN034', notas: 'Power: 54W · Size: Φ235 H150mm · CCT: RGBW(3000K) DMX512 OSRAM · Voltage: AC90-260V · Angle: 25° · Material: AL + TG IP66 · Outlet: Signal 4-core male-female (50cm) / Power 3x0.75mm² rubber cable (1500mm)' },
  { codigo: 'IT-HLXTD18120', notas: 'Power: 48W · CCT: WWW (3000K) · Control: ON/OFF LED chip OSRAM · Voltage: AC100-277V · Size: W63*H70*L1000mm · Angle: 10*15° · Material: AL + TG IP66 · Outlet: 2pin male/female connector' },
]

let actualizados = 0
for (const { codigo, notas } of notas) {
  const res = await col.updateOne(
    { codigo },
    { $set: { notas, updatedAt: new Date() } }
  )
  if (res.modifiedCount > 0) {
    console.log(`✅ ${codigo}`)
    actualizados++
  } else {
    console.log(`⚠️ No encontrado: ${codigo}`)
  }
}

await client.close()
console.log(`\n✅ Actualizados: ${actualizados}`)
