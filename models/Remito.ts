import mongoose, { Schema, Document } from 'mongoose'

export interface ILineaRemito {
  codigo: string
  descripcion: string
  cantidad: number
  unidad: string
}

export interface IRemito extends Document {
  numero: string
  fecha: Date
  id_cliente: string
  razon_social: string
  id_presupuesto: string
  numero_presupuesto: string
  id_orden: string
  numero_orden: string
  lineas: ILineaRemito[]
  notas: string
  estado: string
  createdAt: Date
  updatedAt: Date
}

const LineaRemitoSchema = new Schema<ILineaRemito>(
  {
    codigo: { type: String, default: '' },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true },
    unidad: { type: String, default: 'unidad' },
  },
  { _id: false }
)

const RemitoSchema = new Schema<IRemito>(
  {
    numero: { type: String, required: true, unique: true },
    fecha: { type: Date, default: Date.now },
    id_cliente: { type: String, required: true },
    razon_social: { type: String, required: true },
    id_presupuesto: { type: String, default: '' },
    numero_presupuesto: { type: String, default: '' },
    id_orden: { type: String, default: '' },
    numero_orden: { type: String, default: '' },
    lineas: { type: [LineaRemitoSchema], default: [] },
    notas: { type: String, default: '' },
    estado: {
      type: String,
      enum: ['Borrador', 'Emitido', 'Entregado', 'Cancelado'],
      default: 'Borrador',
    },
  },
  { timestamps: true }
)

export default mongoose.models.Remito ||
  mongoose.model<IRemito>('Remito', RemitoSchema)