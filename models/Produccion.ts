import mongoose, { Schema, Document } from 'mongoose'

interface ComponenteDescontado {
  id_componente: string
  cantidad: number
}

export interface IProduccion extends Document {
  id_produccion: string
  codigo_luminaria: string
  version_receta: number
  cantidad: number
  operario: string
  notas: string
  componentes_descontados: ComponenteDescontado[]
  createdAt: Date
  updatedAt: Date
}

const ComponenteDescontadoSchema = new Schema<ComponenteDescontado>(
  {
    id_componente: { type: String, required: true },
    cantidad: { type: Number, required: true },
  },
  { _id: false }
)

const ProduccionSchema = new Schema<IProduccion>(
  {
    id_produccion: { type: String, required: true, unique: true },
    codigo_luminaria: { type: String, required: true, uppercase: true, trim: true },
    version_receta: { type: Number, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    operario: { type: String, default: 'admin' },
    notas: { type: String, default: '' },
    componentes_descontados: { type: [ComponenteDescontadoSchema], default: [] },
  },
  { timestamps: true }
)

export default mongoose.models.Produccion ||
  mongoose.model<IProduccion>('Produccion', ProduccionSchema)