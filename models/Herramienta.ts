import mongoose, { Schema, Document } from 'mongoose'

export type EstadoHerramienta = 'disponible' | 'en_uso' | 'reparacion' | 'baja'

export interface IHerramienta extends Document {
  codigo: string
  nombre: string
  descripcion: string
  cantidad_total: number
  cantidad_disponible: number
  estado: EstadoHerramienta
  ubicacion: string
  notas: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const HerramientaSchema = new Schema<IHerramienta>(
  {
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    cantidad_total: { type: Number, default: 1 },
    cantidad_disponible: { type: Number, default: 1 },
    estado: { type: String, enum: ['disponible', 'en_uso', 'reparacion', 'baja'], default: 'disponible' },
    ubicacion: { type: String, default: '' },
    notas: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Herramienta ||
  mongoose.model<IHerramienta>('Herramienta', HerramientaSchema)