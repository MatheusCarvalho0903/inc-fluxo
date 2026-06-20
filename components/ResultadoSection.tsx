'use client'

import { useState } from 'react'

interface Props {
  fluxo: string
}

export default function ResultadoSection({ fluxo }: Props) {
  const [copied, setCopied] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(fluxo).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function whatsapp() {
    const encoded = encodeURIComponent(fluxo)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-[#1e3a5f] mb-3">Fluxo Gerado</h2>

      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {fluxo}
      </pre>

      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={copiar}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {copied ? '✓ Copiado!' : '📋 Copiar texto'}
        </button>
        <button
          onClick={whatsapp}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          💬 Enviar no WhatsApp
        </button>
      </div>
    </section>
  )
}
