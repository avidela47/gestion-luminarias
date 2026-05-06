import mongoose, { Schema, Document } from 'mongoose'

interface ComponenteReceta {
  id_componente: string
  cantidad: number
}

export interface IReceta extends Document {
  codigo: string
  nombre: string
  version: number
  fecha_version: Date
  activa: boolean
  componentes: ComponenteReceta[]
  notas: string
  foto: string
  createdAt: Date
  updatedAt: Date
}

const ComponenteRecetaSchema = new Schema<ComponenteReceta>(
  {
    id_componente: { type: String, required: true, uppercase: true, trim: true },
    cantidad: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const RecetaSchema = new Schema<IReceta>(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    version: { type: Number, default: 1 },
    fecha_version: { type: Date, default: Date.now },
    activa: { type: Boolean, default: true },
    componentes: { type: [ComponenteRecetaSchema], default: [] },
    notas: { type: String, default: '' },
    foto: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Receta ||
  mongoose.model<IReceta>('Receta', RecetaSchema)