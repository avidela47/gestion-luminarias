import mongoose, { Schema, Document } from 'mongoose'

export type TipoSensorFuente =
  | 'sensor'
  | 'fuente'
  | 'acoplamiento_flexible'
  | 'actuador'
  | 'espejo'
  | 'iluminacion'
  | 'interruptor_actuador'
  | 'modulo_seguridad'
  | 'soporte'

export interface ISensorFuente extends Document {
  codigo: string
  descripcion: string
  tipo: TipoSensorFuente
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

const SensorFuenteSchema = new Schema<ISensorFuente>(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    tipo: {
      type: String,
      required: true,
      enum: [
        'sensor',
        'fuente',
        'acoplamiento_flexible',
        'actuador',
        'espejo',
        'iluminacion',
        'interruptor_actuador',
        'modulo_seguridad',
        'soporte',
      ],
    },
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

export default mongoose.models.SensorFuente ||
  mongoose.model<ISensorFuente>('SensorFuente', SensorFuenteSchema)