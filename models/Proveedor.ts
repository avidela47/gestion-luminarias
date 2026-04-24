import mongoose, { Schema, Document } from 'mongoose'

export interface IProveedor extends Document {
  id_proveedor: string
  nombre: string
  cuit: string
  telefono: string
  email: string
  direccion: string
  contacto: string
  notas: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const ProveedorSchema = new Schema<IProveedor>(
  {
    id_proveedor: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    cuit: { type: String, default: '' },
    telefono: { type: String, default: '' },
    email: { type: String, default: '' },
    direccion: { type: String, default: '' },
    contacto: { type: String, default: '' },
    notas: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Proveedor ||
  mongoose.model<IProveedor>('Proveedor', ProveedorSchema)