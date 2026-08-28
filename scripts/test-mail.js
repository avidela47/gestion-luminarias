import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config({ path: '.env.local' })

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

await transporter.sendMail({
  from: `"ITELSA SAS" <${process.env.MAIL_USER}>`,
  to: 'fabiopalencia9@hotmail.com',
  subject: 'OT OT-2026-0001 ejecutada — ENERSA',
  html: '<h2>Orden de Trabajo ejecutada correctamente</h2><p>Mail de prueba del sistema ITELSA.</p>',
})

console.log('✅ Mail enviado')