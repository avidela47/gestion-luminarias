import mongoose, { Schema, Document } from 'mongoose'

export interface IProyectoAvance extends Document {
  id_proyecto: string
  numero_proyecto: string
  item_id: string
  modelo: string
  cantidad: number
  realizado_por: string
  createdAt: Date
}

const ProyectoAvanceSchema = new Schema<IProyectoAvance>(
  {
    id_proyecto: { type: String, required: true },
    numero_proyecto: { type: String, required: true },
    item_id: { type: String, required: true },
    modelo: { type: String, required: true },
    cantidad: { type: Number, required: true },
    realizado_por: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.models.ProyectoAvance ||
  mongoose.model<IProyectoAvance>('ProyectoAvance', ProyectoAvanceSchema)
