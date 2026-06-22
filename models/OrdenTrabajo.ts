import mongoose, { Schema, Document } from 'mongoose'

export interface ILineaOrden {
  codigo_luminaria: string
  descripcion: string
  cantidad: number
}

export interface IOrdenTrabajo extends Document {
  numero: string
  fecha: Date
  fecha_entrega: Date
  id_presupuesto: string
  numero_presupuesto: string
  id_cliente: string
  razon_social: string
  vendedor: string
  lineas: ILineaOrden[]
  estado: string
  notas: string
  ejecutada: boolean
  fecha_ejecucion: Date | null
  createdAt: Date
  updatedAt: Date
}

const LineaOrdenSchema = new Schema<ILineaOrden>(
  {
    codigo_luminaria: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const OrdenTrabajoSchema = new Schema<IOrdenTrabajo>(
  {
    numero: { type: String, required: true, unique: true },
    fecha: { type: Date, default: Date.now },
    fecha_entrega: { type: Date },
    id_presupuesto: { type: String, default: '' },
    numero_presupuesto: { type: String, default: '' },
    id_cliente: { type: String, required: true },
    razon_social: { type: String, required: true },
    vendedor: { type: String, default: '' },
    lineas: { type: [LineaOrdenSchema], default: [] },
    estado: {
      type: String,
      enum: ['Pendiente', 'En proceso', 'Completada', 'Cancelada'],
      default: 'Pendiente',
    },
    notas: { type: String, default: '' },
    ejecutada: { type: Boolean, default: false },
    fecha_ejecucion: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.models.OrdenTrabajo ||
  mongoose.model<IOrdenTrabajo>('OrdenTrabajo', OrdenTrabajoSchema)