import mongoose from 'mongoose'
import Usuario from '../models/Usuario'

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)
  const usuarios = await Usuario.find().select('nombre username rol activo')
  console.log(usuarios)
  await mongoose.disconnect()
}

main()
