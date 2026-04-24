import mongoose, { Schema, Document } from 'mongoose'

export interface IComponente extends Document {
  id_componente: string
  nombre: string
  unidad: string
  stock_actual: number
  stock_minimo: number
  proveedor: string
  precio_unitario: number
  ubicacion: string
  notas: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const ComponenteSchema = new Schema<IComponente>(
  {
    id_componente: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    unidad: { type: String, required: true, default: 'unidad' },
    stock_actual: { type: Number, required: true, default: 0 },
    stock_minimo: { type: Number, required: true, default: 0 },
    proveedor: { type: String, default: '' },
    precio_unitario: { type: Number, default: 0 },
    ubicacion: { type: String, default: '' },
    notas: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Componente ||
  mongoose.model<IComponente>('Componente', ComponenteSchema)