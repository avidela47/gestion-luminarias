import mongoose, { Schema, Document } from 'mongoose'

export interface ILineaPresupuesto {
  codigo: string
  descripcion: string
  cantidad: number
  bonificacion: number
  precio_unitario: number
  precio_total: number
  plazo_entrega_linea: string
}

export interface IPresupuesto extends Document {
  numero: string
  fecha: Date
  validez_dias: number
  vendedor: string
  id_cliente: string
  razon_social: string
  cuit: string
  direccion: string
  localidad: string
  telefono: string
  email: string
  atencion: string
  condicion_iva: string
  lineas: ILineaPresupuesto[]
  moneda: string
  subtotal: number
  iva: number
  total: number
  forma_pago: string
  plazo_entrega: string
  cotizacion: string
  comentario: string
  estado: string
  notas: string
  createdAt: Date
  updatedAt: Date
}

const LineaPresupuestoSchema = new Schema<ILineaPresupuesto>(
  {
    codigo: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    bonificacion: { type: Number, default: 0 },
    precio_unitario: { type: Number, required: true },
    precio_total: { type: Number, required: true },
    plazo_entrega_linea: { type: String, default: '' },
  },
  { _id: false }
)

const PresupuestoSchema = new Schema<IPresupuesto>(
  {
    numero: { type: String, required: true, unique: true },
    fecha: { type: Date, default: Date.now },
    validez_dias: { type: Number, default: 5 },
    vendedor: { type: String, default: 'ARIEL VIDELA' },
    id_cliente: { type: String, required: true },
    razon_social: { type: String, required: true },
    cuit: { type: String, default: '' },
    direccion: { type: String, default: '' },
    localidad: { type: String, default: '' },
    telefono: { type: String, default: '' },
    email: { type: String, default: '' },
    atencion: { type: String, default: '' },
    condicion_iva: { type: String, default: '' },
    lineas: { type: [LineaPresupuestoSchema], default: [] },
    moneda: { type: String, default: 'U$S' },
    subtotal: { type: Number, default: 0 },
    iva: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    forma_pago: { type: String, default: '' },
    plazo_entrega: { type: String, default: '' },
    cotizacion: { type: String, default: '' },
    comentario: { type: String, default: '' },
    estado: {
      type: String,
      enum: ['Borrador', 'Enviado', 'Aprobado', 'Rechazado'],
      default: 'Borrador',
    },
    notas: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Presupuesto ||
  mongoose.model<IPresupuesto>('Presupuesto', PresupuestoSchema)