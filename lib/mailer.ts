import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export async function enviarMailOT({
  numero,
  cliente,
  vendedor,
  fecha,
  fecha_entrega,
  lineas,
}: {
  numero: string
  cliente: string
  vendedor: string
  fecha: string
  fecha_entrega?: string
  lineas: { codigo_luminaria: string; descripcion: string; cantidad: number }[]
}) {
  const filasLineas = lineas.map((l) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#2d7d78">${l.codigo_luminaria}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${l.descripcion}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700">${l.cantidad}</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a2332">
      <div style="background:#0f1923;padding:24px 32px;border-radius:8px 8px 0 0">
        <div style="color:#2d7d78;font-size:22px;font-weight:800;letter-spacing:1px">ITELSA SAS</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:4px">Sistema de Gestión</div>
      </div>

      <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none">
        <h2 style="font-size:18px;font-weight:700;color:#1a2332;margin:0 0 8px">
          Nueva Orden de Trabajo ejecutada
        </h2>
        <div style="font-size:24px;font-weight:800;color:#2d7d78;margin-bottom:24px">${numero}</div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px">
          <tr>
            <td style="padding:6px 0;color:#64748b;width:120px">Cliente:</td>
            <td style="padding:6px 0;font-weight:600">${cliente}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b">Vendedor:</td>
            <td style="padding:6px 0;font-weight:600">${vendedor}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b">Fecha:</td>
            <td style="padding:6px 0">${fecha}</td>
          </tr>
          ${fecha_entrega ? `
          <tr>
            <td style="padding:6px 0;color:#64748b">Entrega:</td>
            <td style="padding:6px 0;font-weight:600;color:#dc2626">${fecha_entrega}</td>
          </tr>` : ''}
        </table>

        <div style="font-size:11px;font-weight:700;color:#64748b;letter-spacing:1px;margin-bottom:8px">LUMINARIAS</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
          <thead>
            <tr style="background:#0f1923;color:#fff">
              <th style="padding:8px 12px;text-align:left;font-weight:600">Código</th>
              <th style="padding:8px 12px;text-align:left;font-weight:600">Descripción</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600">Cantidad</th>
            </tr>
          </thead>
          <tbody>${filasLineas}</tbody>
        </table>

        <div style="background:#f0fdf4;border:1px solid #16a34a;border-radius:6px;padding:12px 16px;font-size:13px;color:#16a34a;font-weight:600">
          ✅ Stock descontado correctamente — lista para despachar
        </div>
      </div>

      <div style="background:#f8fafc;padding:16px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;font-size:11px;color:#94a3b8;text-align:center">
        ITELSA SAS · Bv. Cristóbal Berritella 7365 · Córdoba · ${new Date().getFullYear()}
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
    to: 'fabiopalencia9@hotmail.com',
    subject: `OT ${numero} ejecutada — ${cliente}`,
    html,
  })
}