import mongoose, { Schema, Document } from 'mongoose'

export type TipoMovimiento =
  | 'entrada_compra'
  | 'salida_produccion'
  | 'ajuste_manual_entrada'
  | 'ajuste_manual_salida'

export interface IMovimiento extends Document {
  id_movimiento: string
  tipo: TipoMovimiento
  id_componente: string
  cantidad: number
  stock_resultante: number
  referencia: string
  notas: string
  usuario: string
  createdAt: Date
  updatedAt: Date
}

const MovimientoSchema = new Schema<IMovimiento>(
  {
    id_movimiento: { type: String, required: true, unique: true },
    tipo: {
      type: String,
      required: true,
      enum: [
        'entrada_compra',
        'salida_produccion',
        'ajuste_manual_entrada',
        'ajuste_manual_salida',
      ],
    },
    id_componente: { type: String, required: true, uppercase: true, trim: true },
    cantidad: { type: Number, required: true },
    stock_resultante: { type: Number, required: true },
    referencia: { type: String, default: '' },
    notas: { type: String, default: '' },
    usuario: { type: String, default: 'admin' },
  },
  { timestamps: true }
)

export default mongoose.models.Movimiento ||
  mongoose.model<IMovimiento>('Movimiento', MovimientoSchema)