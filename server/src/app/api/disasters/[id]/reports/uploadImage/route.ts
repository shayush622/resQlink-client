import { NextRequest } from 'next/server'
import imagekit from '@/lib/imageKit'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: file.name,
    })

    return new Response(JSON.stringify(uploadResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } 
  catch  {
    // console.error('Upload error:', err)
    return new Response(JSON.stringify({ error: 'Image upload failed' }), { status: 500 })
  }
}
