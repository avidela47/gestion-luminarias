import mongoose, { Schema, Document } from 'mongoose'

export type TipoMovimientoMaterial = 'entrada' | 'salida' | 'devolucion'

export interface IMovimientoMaterial extends Document {
  tipo: TipoMovimientoMaterial
  id_material: string
  codigo_material: string
  descripcion_material: string
  cantidad: number
  stock_resultante: number
  precio_unitario: number
  id_orden: string
  numero_orden: string
  notas: string
  usuario: string
  createdAt: Date
  updatedAt: Date
}

const MovimientoMaterialSchema = new Schema<IMovimientoMaterial>(
  {
    tipo: { type: String, required: true, enum: ['entrada', 'salida', 'devolucion'] },
    id_material: { type: String, required: true },
    codigo_material: { type: String, required: true },
    descripcion_material: { type: String, required: true },
    cantidad: { type: Number, required: true },
    stock_resultante: { type: Number, required: true },
    precio_unitario: { type: Number, default: 0 },
    id_orden: { type: String, default: '' },
    numero_orden: { type: String, default: '' },
    notas: { type: String, default: '' },
    usuario: { type: String, default: 'admin' },
  },
  { timestamps: true }
)

export default mongoose.models.MovimientoMaterial ||
  mongoose.model<IMovimientoMaterial>('MovimientoMaterial', MovimientoMaterialSchema)