import mongoose from 'mongoose'
import OrdenTrabajo from '../models/OrdenTrabajo'

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  const ordenes = await OrdenTrabajo.find().sort({ createdAt: -1 }).limit(5).select('numero ejecutada estado id_proyecto_fabrica razon_social')
  console.log(ordenes)
  await mongoose.disconnect()
}

main()
