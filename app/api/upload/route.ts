import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await (file as File).arrayBuffer())

    // Redimensionar a 300x300 manteniendo proporción y rellenando con blanco
    const resized = await sharp(buffer)
      .resize(300, 300, { fit: 'contain', background: { r: 243, g: 244, b: 246, alpha: 1 } })
      .jpeg({ quality: 85 })
      .toBuffer()

    const resizedFile = new File([resized], (file as File).name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })

    const vpsForm = new FormData()
    vpsForm.append('file', resizedFile)
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