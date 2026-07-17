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
    if (code) vpsForm.append('code', code.toString())
    const vpsRes = await fetch('https://itelsasas.com/api/uploads/gestion', {
      method: 'POST',
      body: vpsForm,
    })
    const data = await vpsRes.json()
    if (!vpsRes.ok) {
      return NextResponse.json({ ok: false, error: data?.msg || 'Error en VPS' }, { status: 502 })
    }
    return NextResponse.json({
      ok: true,
      url: `https://itelsasas.com/uploads/gestion/${data.fileName}`,
      fileName: data.fileName,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}