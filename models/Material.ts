import mongoose, { Schema, Document } from 'mongoose'

export interface IMaterial extends Document {
  codigo: string
  descripcion: string
  imagen: string
  stock_actual: number
  stock_minimo: number
  precio_unitario: number
  unidad: string
  notas: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const MaterialSchema = new Schema<IMaterial>(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    imagen: { type: String, default: '' },
    stock_actual: { type: Number, default: 0 },
    stock_minimo: { type: Number, default: 0 },
    precio_unitario: { type: Number, default: 0 },
    unidad: { type: String, default: 'unidad' },
    notas: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Material ||
  mongoose.model<IMaterial>('Material', MaterialSchema)