import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    const vpsForm = new FormData()
    vpsForm.append('file', file)

    const code = formData.get('code')
    if (code) vpsForm.append('code', code)

    const vpsRes = await fetch(process.env.UPLOAD_VPS_URL!, {
      method: 'POST',
      body: vpsForm,
    })

    if (!vpsRes.ok) {
      const err = await vpsRes.text()
      return NextResponse.json({ ok: false, error: err }, { status: 502 })
    }

    const data = await vpsRes.json()

    return NextResponse.json({
      ok: true,
      url: `${process.env.NEXT_PUBLIC_UPLOADS_BASE}/${data.fileName}`,
      fileName: data.fileName,
    })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json({ ok: false, error: 'Error subiendo archivo' }, { status: 500 })
  }
}