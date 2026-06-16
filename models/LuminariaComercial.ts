import mongoose, { Schema, Document } from 'mongoose'

export interface ILuminariaComercial extends Document {
  codigo: string
  descripcion: string
  origen: 'importada' | 'nacional'
  stock_actual: number
  stock_minimo: number
  precio: number
  proveedor: string
  notas: string
  foto: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const LuminariaComercialSchema = new Schema<ILuminariaComercial>(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    origen: { type: String, enum: ['importada', 'nacional'], default: 'importada' },
    stock_actual: { type: Number, default: 0 },
    stock_minimo: { type: Number, default: 0 },
    precio: { type: Number, default: 0 },
    proveedor: { type: String, default: '' },
    notas: { type: String, default: '' },
    foto: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.LuminariaComercial ||
  mongoose.model<ILuminariaComercial>('LuminariaComercial', LuminariaComercialSchema)