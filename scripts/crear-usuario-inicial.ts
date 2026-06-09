import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI!

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  username: String,
  password: String,
  rol: String,
  activo: Boolean,
}, { timestamps: true })

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema)

async function main() {
  await mongoose.connect(MONGODB_URI)
  console.log('Conectado a MongoDB')

  const existe = await Usuario.findOne({ username: 'usuario' })
  if (existe) {
    console.log('Usuario ya existe')
    process.exit(0)
  }

  const hash = await bcrypt.hash('usuario', 10)
  await Usuario.create({
    nombre: 'Usuario',
    username: 'usuario',
    password: hash,
    rol: 'usuario',
    activo: true,
  })

  const hash2 = await bcrypt.hash('itelsa2026', 10)
  await Usuario.create({
    nombre: 'Admin',
    username: 'admin',
    password: hash2,
    rol: 'admin',
    activo: true,
  })

  console.log('Usuarios creados: usuario/usuario y admin/itelsa2026')
  process.exit(0)
}

main().catch(console.error)