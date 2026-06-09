import mongoose, { Schema, Document } from 'mongoose'

export interface IUsuario extends Document {
  nombre: string
  username: string
  password: string
  rol: 'admin' | 'usuario'
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nombre: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Usuario ||
  mongoose.model<IUsuario>('Usuario', UsuarioSchema)