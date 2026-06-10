import mongoose, { Schema, Document } from 'mongoose'

export type TipoItem = 'stock' | 'herramienta' | 'otro'
export type EstadoVale = 'abierto' | 'devolucion_parcial' | 'cerrado'

export interface IItemVale {
  descripcion: string
  cantidad_salida: number
  cantidad_devuelta: number
  tipo: TipoItem
  notas: string
}

export interface IVale extends Document {
  numero: string
  fecha_salida: Date
  fecha_devolucion?: Date
  responsable: string
  emitido_por: string
  estado: EstadoVale
  items: IItemVale[]
  observaciones_salida: string
  observaciones_devolucion: string
  createdAt: Date
  updatedAt: Date
}

const ItemValeSchema = new Schema<IItemVale>(
  {
    descripcion: { type: String, required: true, trim: true },
    cantidad_salida: { type: Number, required: true, min: 1 },
    cantidad_devuelta: { type: Number, default: 0 },
    tipo: { type: String, enum: ['stock', 'herramienta', 'otro'], default: 'otro' },
    notas: { type: String, default: '' },
  },
  { _id: false }
)

const ValeSchema = new Schema<IVale>(
  {
    numero: { type: String, required: true, unique: true },
    fecha_salida: { type: Date, default: Date.now },
    fecha_devolucion: { type: Date },
    responsable: { type: String, required: true, trim: true },
    emitido_por: { type: String, required: true, trim: true },
    estado: { type: String, enum: ['abierto', 'devolucion_parcial', 'cerrado'], default: 'abierto' },
    items: { type: [ItemValeSchema], default: [] },
    observaciones_salida: { type: String, default: '' },
    observaciones_devolucion: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Vale ||
  mongoose.model<IVale>('Vale', ValeSchema)