import mongoose, { Schema, Document } from 'mongoose'

export interface IItemDespacho {
  codigo: string
  descripcion: string
  cantidad: number
  tipo: 'fabricada' | 'comercial' | 'deposito' | 'sensor'
  precio_unitario: number
}

export interface IDespacho extends Document {
  numero: string
  fecha: Date
  id_presupuesto: string
  numero_presupuesto: string
  razon_social: string
  id_cliente: string
  items: IItemDespacho[]
  estado: 'pendiente' | 'despachado' | 'anulado'
  observaciones: string
  createdAt: Date
  updatedAt: Date
}

const ItemDespachoSchema = new Schema<IItemDespacho>(
  {
    codigo: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    tipo: { type: String, enum: ['fabricada', 'comercial', 'deposito', 'sensor'], required: true },
    precio_unitario: { type: Number, default: 0 },
  },
  { _id: false }
)

const DespachoSchema = new Schema<IDespacho>(
  {
    numero: { type: String, required: true, unique: true },
    fecha: { type: Date, default: Date.now },
    id_presupuesto: { type: String, default: '' },
    numero_presupuesto: { type: String, default: '' },
    razon_social: { type: String, required: true },
    id_cliente: { type: String, default: '' },
    items: { type: [ItemDespachoSchema], default: [] },
    estado: { type: String, enum: ['pendiente', 'despachado', 'anulado'], default: 'pendiente' },
    observaciones: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Despacho ||
  mongoose.model<IDespacho>('Despacho', DespachoSchema)