import mongoose, { Schema, Document } from 'mongoose'

export interface IPago {
  fecha: Date
  monto_usd: number
  tipo_cambio: number
  monto_pesos: number
  forma_pago: string
  notas: string
}

export interface ILineaRecibo {
  descripcion: string
  monto_usd: number
}

export interface IRecibo extends Document {
  numero: string
  fecha: Date
  id_cliente: string
  razon_social: string
  id_presupuesto: string
  numero_presupuesto: string
  id_orden: string
  numero_orden: string
  concepto: string
  lineas_detalle: ILineaRecibo[]
  total_usd: number
  pagos: IPago[]
  total_pagado_usd: number
  saldo_usd: number
  estado: string
  notas: string
  createdAt: Date
  updatedAt: Date
}

const PagoSchema = new Schema<IPago>(
  {
    fecha: { type: Date, default: Date.now },
    monto_usd: { type: Number, required: true },
    tipo_cambio: { type: Number, required: true },
    monto_pesos: { type: Number, required: true },
    forma_pago: { type: String, required: true },
    notas: { type: String, default: '' },
  },
  { _id: true }
)

const LineaReciboSchema = new Schema<ILineaRecibo>(
  {
    descripcion: { type: String, required: true },
    monto_usd: { type: Number, required: true },
  },
  { _id: false }
)

const ReciboSchema = new Schema<IRecibo>(
  {
    numero: { type: String, required: true, unique: true },
    fecha: { type: Date, default: Date.now },
    id_cliente: { type: String, required: true },
    razon_social: { type: String, required: true },
    id_presupuesto: { type: String, default: '' },
    numero_presupuesto: { type: String, default: '' },
    id_orden: { type: String, default: '' },
    numero_orden: { type: String, default: '' },
    concepto: { type: String, default: '' },
    lineas_detalle: { type: [LineaReciboSchema], default: [] },
    total_usd: { type: Number, required: true },
    pagos: { type: [PagoSchema], default: [] },
    total_pagado_usd: { type: Number, default: 0 },
    saldo_usd: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ['Pendiente de pago', 'Pago parcial', 'Cancelado'],
      default: 'Pendiente de pago',
    },
    notas: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Recibo ||
  mongoose.model<IRecibo>('Recibo', ReciboSchema)