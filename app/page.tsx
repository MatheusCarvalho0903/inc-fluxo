'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import LaudoSection from '@/components/LaudoSection'
import RegrasSection, { type Regras } from '@/components/RegrasSection'
import ResultadoSection from '@/components/ResultadoSection'

const REGRAS_DEFAULTS: Regras = {
  nomeEmpreendimento: '',
  precoTabela: 0,
  percentualMaxFinanciamento: 80,
  intermediariaValor: 0,
  intermediariaQuantidade: 0,
  intermediariaCadencia: 'mensal',
  intermediariaPrimeiraData: '',
  parcelasINC: 60,
}

export default function Home() {
  const [laudoTexto, setLaudoTexto] = useState('')
  const [laudoImagem, setLaudoImagem] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [regras, setRegras] = useState<Regras>(REGRAS_DEFAULTS)
  const [fluxo, setFluxo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const temLaudo = laudoTexto.trim().length > 0 || laudoImagem !== null

  async function gerarFluxo() {
    setLoading(true)
    setErro(null)
    try {
      const body: Record<string, unknown> = { regras }
      if (laudoImagem) {
        body.laudoImagem = laudoImagem
        body.mimeType = mimeType
      } else {
        body.laudoTexto = laudoTexto
      }

      const res = await fetch('/api/gerar-fluxo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido')
      setFluxo(data.fluxo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar fluxo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <LaudoSection
          laudoTexto={laudoTexto}
          setLaudoTexto={setLaudoTexto}
          laudoImagem={laudoImagem}
          setLaudoImagem={setLaudoImagem}
          mimeType={mimeType}
          setMimeType={setMimeType}
        />

        <RegrasSection regras={regras} setRegras={setRegras} />

        <div className="flex flex-col items-stretch gap-2">
          <button
            onClick={gerarFluxo}
            disabled={!temLaudo || loading}
            className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-base py-3 rounded-xl transition-colors shadow-sm"
          >
            {loading ? 'Gerando fluxo...' : 'Gerar Fluxo'}
          </button>
          {!temLaudo && (
            <p className="text-xs text-center text-gray-400">
              Cole o laudo ou envie uma imagem para habilitar o botão
            </p>
          )}
          {erro && (
            <p className="text-sm text-center text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
              {erro}
            </p>
          )}
        </div>

        {fluxo && <ResultadoSection fluxo={fluxo} />}
      </main>
    </div>
  )
}
