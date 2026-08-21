import mongoose, { Schema, Document } from 'mongoose'

export interface IMensaje extends Document {
  autor: string
  texto: string
  createdAt: Date
}

const MensajeSchema = new Schema<IMensaje>(
  {
    autor: { type: String, required: true },
    texto: { type: String, required: true, trim: true },
  },
  { timestamps: true }
)

export default mongoose.models.Mensaje ||
  mongoose.model<IMensaje>('Mensaje', MensajeSchema)
