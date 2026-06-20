'use client'

import { useState } from 'react'

interface Props {
  fluxo: string
  dadosFluxo: object
  nomeEmpreendimento: string
  nomeCliente: string
}

export default function ResultadoSection({ fluxo, dadosFluxo, nomeEmpreendimento, nomeCliente }: Props) {
  const [copied, setCopied] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(fluxo).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(fluxo)}`, '_blank')
  }

  async function baixarPdf() {
    setLoadingPdf(true)
    try {
      const res = await fetch('/api/gerar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosFluxo),
      })
      if (!res.ok) throw new Error('Erro ao gerar PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
      const nome = nomeEmpreendimento.toLowerCase().replace(/\s+/g, '-')
      const cliente = nomeCliente.toLowerCase().replace(/\s+/g, '-')
      a.href = url
      a.download = `fluxo-${nome}-${cliente}-${data}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao gerar PDF')
    } finally {
      setLoadingPdf(false)
    }
  }

  const outlineCls =
    'flex items-center gap-2 border border-inc-primary text-inc-primary hover:bg-inc-primary hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors'

  return (
    <section className="bg-inc-light border-l-4 border-inc-primary rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-inc-text mb-3">Fluxo Gerado</h2>

      <pre className="bg-white border border-gray-200 rounded-lg p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {fluxo}
      </pre>

      <div className="flex flex-wrap gap-3 mt-4">
        <button onClick={copiar} className={outlineCls}>
          {copied ? '✓ Copiado!' : '📋 Copiar texto'}
        </button>
        <button onClick={whatsapp} className={outlineCls}>
          💬 Enviar no WhatsApp
        </button>
        <button onClick={baixarPdf} disabled={loadingPdf} className={`${outlineCls} disabled:opacity-50 disabled:cursor-not-allowed`}>
          {loadingPdf ? 'Gerando PDF...' : '📄 Baixar PDF'}
        </button>
      </div>
    </section>
  )
}
