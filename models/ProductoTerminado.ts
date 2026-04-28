import mongoose, { Schema, Document } from 'mongoose'

export interface IProductoTerminado extends Document {
  codigo_luminaria: string
  nombre: string
  stock_actual: number
  stock_minimo: number
  precio_venta: number
  notas: string
  foto: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductoTerminadoSchema = new Schema<IProductoTerminado>(
  {
    codigo_luminaria: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    stock_actual: { type: Number, default: 0 },
    stock_minimo: { type: Number, default: 0 },
    precio_venta: { type: Number, default: 0 },
    notas: { type: String, default: '' },
    activo: { type: Boolean, default: true },
    foto: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.ProductoTerminado ||
  mongoose.model<IProductoTerminado>('ProductoTerminado', ProductoTerminadoSchema)