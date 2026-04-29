import mongoose, { Schema, Document } from 'mongoose'

export interface ICliente extends Document {
  id_cliente: string
  nombre: string
  razon_social: string
  cuit: string
  telefono: string
  email: string
  direccion: string
  localidad: string
  provincia: string
  contacto: string
  condicion_iva: string
  notas: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const ClienteSchema = new Schema<ICliente>(
  {
    id_cliente: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    razon_social: { type: String, default: '' },
    cuit: { type: String, default: '' },
    telefono: { type: String, default: '' },
    email: { type: String, default: '' },
    direccion: { type: String, default: '' },
    localidad: { type: String, default: '' },
    provincia: { type: String, default: '' },
    contacto: { type: String, default: '' },
   condicion_iva: {
      type: String,
      enum: [
        'Responsable Inscripto',
        'Responsable Inscripto 10',
        'Responsable Inscripto M',
        'Monotributo',
        'Exento',
        'Consumidor Final',
        'No Categorizado',
        'Operaciones Turismo',
        'Resp Insc Ley 16744 - L Boca',
      ],
      default: 'Responsable Inscripto',
    },
    notas: { type: String, default: '' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Cliente ||
  mongoose.model<ICliente>('Cliente', ClienteSchema)