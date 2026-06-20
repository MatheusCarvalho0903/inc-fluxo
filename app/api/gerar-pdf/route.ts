import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { createElement } from 'react'
import FluxoPDF, { type FluxoPDFData } from '@/components/FluxoPDF'

export async function POST(req: NextRequest) {
  try {
    const data: FluxoPDFData = await req.json()

    // renderToBuffer precisa de um elemento Document no topo
    const docElement = createElement(Document, null,
      createElement(Page, { size: 'A4' as const },
        // placeholder — o componente real renderiza o Document internamente
      )
    )

    // Renderiza o componente FluxoPDF que já inclui o <Document>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(createElement(FluxoPDF, { data }) as any)
    const uint8 = new Uint8Array(buffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="fluxo.pdf"',
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 })
  }
}
