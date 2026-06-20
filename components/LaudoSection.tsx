'use client'

import { useRef, useState } from 'react'

interface Props {
  laudoTexto: string
  setLaudoTexto: (v: string) => void
  laudoImagem: string | null
  setLaudoImagem: (v: string | null) => void
  mimeType: string | null
  setMimeType: (v: string | null) => void
}

export default function LaudoSection({
  laudoTexto,
  setLaudoTexto,
  laudoImagem,
  setLaudoImagem,
  mimeType,
  setMimeType,
}: Props) {
  const [aba, setAba] = useState<'texto' | 'imagem'>('texto')
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function processFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG ou PDF.')
      return
    }
    setFileName(file.name)
    setMimeType(file.type === 'application/pdf' ? 'image/png' : (file.type as string))
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // strip data URL prefix → pure base64
      setLaudoImagem(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-[#1e3a5f] mb-3">Laudo de Aprovação</h2>

      <div className="flex gap-2 mb-4">
        {(['texto', 'imagem'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              aba === tab
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'texto' ? 'Colar Texto' : 'Enviar Imagem'}
          </button>
        ))}
      </div>

      {aba === 'texto' ? (
        <textarea
          value={laudoTexto}
          onChange={(e) => setLaudoTexto(e.target.value)}
          placeholder="Cole aqui o laudo da Caixa ou mensagem do corretor..."
          rows={8}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
        />
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-[#1e3a5f] bg-blue-50' : 'border-gray-300 hover:border-[#2a5298]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
          />
          {laudoImagem ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium text-sm">✓ Arquivo carregado</p>
              <p className="text-gray-500 text-xs">{fileName}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setLaudoImagem(null); setMimeType(null); setFileName(null) }}
                className="text-red-500 text-xs underline mt-1"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-3xl text-gray-300">📎</div>
              <p className="text-sm text-gray-500">Arraste e solte ou clique para selecionar</p>
              <p className="text-xs text-gray-400">JPG, PNG ou PDF</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
