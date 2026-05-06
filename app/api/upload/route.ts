import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const vpsUrl = process.env.UPLOAD_VPS_URL
  const uploadsBase = process.env.NEXT_PUBLIC_UPLOADS_BASE

  if (!vpsUrl || !uploadsBase) {
    console.error('[upload] Variables de entorno faltantes:', { vpsUrl, uploadsBase })
    return NextResponse.json({ ok: false, error: 'Configuración de servidor incompleta' }, { status: 500 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    const vpsForm = new FormData()
    vpsForm.append('file', file)

    const code = formData.get('code')
    if (code) vpsForm.append('code', code.toString())

    const vpsRes = await fetch(vpsUrl, {
      method: 'POST',
      body: vpsForm,
    })

    const data = await vpsRes.json()

    if (!vpsRes.ok) {
      console.error('[upload] VPS error:', data)
      return NextResponse.json({ ok: false, error: data?.msg || 'Error en VPS' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      url: `${uploadsBase}/${data.fileName}`,
      fileName: data.fileName,
    })
  } catch (e) {
    console.error('[upload] excepción:', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}