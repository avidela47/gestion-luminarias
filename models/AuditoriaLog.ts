import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditoriaLog extends Document {
  usuario_id: string
  usuario_nombre: string
  usuario_username: string
  accion: 'crear' | 'editar' | 'eliminar' | 'ver'
  modulo: string
  detalle: string
  dato_id: string
  ip: string
  createdAt: Date
}

const AuditoriaLogSchema = new Schema<IAuditoriaLog>(
  {
    usuario_id: { type: String, required: true },
    usuario_nombre: { type: String, required: true },
    usuario_username: { type: String, required: true },
    accion: { type: String, enum: ['crear', 'editar', 'eliminar', 'ver'], required: true },
    modulo: { type: String, required: true },
    detalle: { type: String, default: '' },
    dato_id: { type: String, default: '' },
    ip: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.AuditoriaLog ||
  mongoose.model<IAuditoriaLog>('AuditoriaLog', AuditoriaLogSchema)