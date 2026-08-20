import mongoose, { Schema, Document } from 'mongoose'

export interface IProyectoItem {
  id: string
  modelo: string
  cantidad_solicitada: number
  optica: string
  cantidad_completada: number
}

export interface IProyecto extends Document {
  numero: string
  cliente: string
  nombre: string
  fecha_objetivo: Date | null
  prioridad: 'NORMAL' | 'URGENTE'
  notas: string
  estado: 'NUEVO' | 'PREPARACION' | 'FABRICACION' | 'LISTO'
  items: IProyectoItem[]
  tomado_por: string | null
  fecha_tomado: Date | null
  alerta_activa: boolean
  alerta_revision: number
  alerta_cambios: string[]
  alerta_confirmada_por: string[]
  fecha_listo: Date | null
  id_orden_trabajo: string
  numero_orden_trabajo: string
  createdAt: Date
  updatedAt: Date
}

const ProyectoItemSchema = new Schema<IProyectoItem>(
  {
    id: { type: String, required: true },
    modelo: { type: String, required: true },
    cantidad_solicitada: { type: Number, required: true, min: 1 },
    optica: { type: String, required: true },
    cantidad_completada: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
)

const ProyectoSchema = new Schema<IProyecto>(
  {
    numero: { type: String, required: true, unique: true },
    cliente: { type: String, required: true },
    nombre: { type: String, default: '' },
    fecha_objetivo: { type: Date, default: null },
    prioridad: { type: String, enum: ['NORMAL', 'URGENTE'], default: 'NORMAL' },
    notas: { type: String, default: '' },
    estado: { type: String, enum: ['NUEVO', 'PREPARACION', 'FABRICACION', 'LISTO'], default: 'NUEVO' },
    items: { type: [ProyectoItemSchema], default: [] },
    tomado_por: { type: String, default: null },
    fecha_tomado: { type: Date, default: null },
    alerta_activa: { type: Boolean, default: true },
    alerta_revision: { type: Number, default: 1 },
    alerta_cambios: { type: [String], default: [] },
    alerta_confirmada_por: { type: [String], default: [] },
    fecha_listo: { type: Date, default: null },
    id_orden_trabajo: { type: String, default: '' },
    numero_orden_trabajo: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Proyecto ||
  mongoose.model<IProyecto>('Proyecto', ProyectoSchema)