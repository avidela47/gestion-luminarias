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

const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2332">
    <div style="background:#0f1923;padding:24px 32px;border-radius:8px 8px 0 0">
      <div style="color:#2d7d78;font-size:22px;font-weight:800">ITELSA SAS</div>
      <div style="color:#94a3b8;font-size:12px;margin-top:4px">Sistema de Gestión</div>
    </div>
    <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none">
      <h2 style="font-size:18px;font-weight:700;margin:0 0 8px">Nueva Orden de Trabajo ejecutada</h2>
      <div style="font-size:24px;font-weight:800;color:#2d7d78;margin-bottom:24px">OT-2026-0001</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
        <tr><td style="padding:6px 0;color:#64748b;width:120px">Cliente:</td><td style="padding:6px 0;font-weight:600">ENERSA</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Vendedor:</td><td style="padding:6px 0;font-weight:600">ARIEL VIDELA</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Fecha:</td><td style="padding:6px 0">28/8/2026</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Entrega:</td><td style="padding:6px 0;font-weight:600;color:#dc2626">3/9/2026</td></tr>
      </table>
      <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:8px">LUMINARIAS</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
        <thead>
          <tr style="background:#0f1923;color:#fff">
            <th style="padding:8px 12px;text-align:left">Código</th>
            <th style="padding:8px 12px;text-align:left">Descripción</th>
            <th style="padding:8px 12px;text-align:center">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#2d7d78">SYP232-100-100-6</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">PROYECTOR LED ALTO RENDIMIENTO 100W - LENTES KATHOD PMMA 100° DRIVER DIM</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700">50</td>
          </tr>
        </tbody>
      </table>
      <div style="background:#f0fdf4;border:1px solid #16a34a;border-radius:6px;padding:12px 16px;font-size:13px;color:#16a34a;font-weight:600">
        ✅ En fábrica — pendiente de producción
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;font-size:11px;color:#94a3b8;text-align:center">
      ITELSA SAS · Bv. Cristóbal Berritella 7365 · Córdoba · 2026
    </div>
  </div>
`

await transporter.sendMail({
  from: `"ITELSA SAS" <${process.env.MAIL_USER}>`,
  to: 'fabiopalencia9@hotmail.com',
  subject: 'OT OT-2026-0001 ejecutada — ENERSA',
  html,
})

console.log('✅ Mail enviado')
