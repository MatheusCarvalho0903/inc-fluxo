'use client'

import { useEffect, useState } from 'react'

export interface Regras {
  nomeEmpreendimento: string
  precoTabela: number
  percentualMaxFinanciamento: number
  intermediariaValor: number
  intermediariaQuantidade: number
  intermediariaCadencia: 'mensal' | 'semestral' | 'anual'
  intermediariaPrimeiraData: string
  parcelasINC: number
}

const DEFAULTS: Regras = {
  nomeEmpreendimento: '',
  precoTabela: 0,
  percentualMaxFinanciamento: 80,
  intermediariaValor: 0,
  intermediariaQuantidade: 0,
  intermediariaCadencia: 'mensal',
  intermediariaPrimeiraData: '',
  parcelasINC: 60,
}

const STORAGE_KEY = 'inc-fluxo-empreendimentos'

function loadAll(): Record<string, Regras> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

interface Props {
  regras: Regras
  setRegras: (r: Regras) => void
}

export default function RegrasSection({ regras, setRegras }: Props) {
  const [saved, setSaved] = useState<Record<string, Regras>>({})
  const [selected, setSelected] = useState<string>('__novo__')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setSaved(loadAll())
  }, [])

  function handleSelectChange(value: string) {
    setSelected(value)
    if (value === '__novo__') {
      setRegras(DEFAULTS)
    } else {
      const r = saved[value]
      if (r) setRegras(r)
    }
  }

  function handleSave() {
    const nome = regras.nomeEmpreendimento.trim()
    if (!nome) {
      setFeedback('Informe o nome do empreendimento antes de salvar.')
      return
    }
    const updated = { ...saved, [nome]: regras }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSaved(updated)
    setSelected(nome)
    setFeedback('Regras salvas com sucesso!')
    setTimeout(() => setFeedback(''), 3000)
  }

  function field(label: string, node: React.ReactNode) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        {node}
      </div>
    )
  }

  const inputCls =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent w-full'

  function num(key: keyof Regras) {
    return (
      <input
        type="number"
        className={inputCls}
        value={(regras[key] as number) || ''}
        onChange={(e) => setRegras({ ...regras, [key]: parseFloat(e.target.value) || 0 })}
      />
    )
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-[#1e3a5f] mb-4">Regras do Empreendimento</h2>

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Empreendimento</label>
        <select
          value={selected}
          onChange={(e) => handleSelectChange(e.target.value)}
          className={inputCls}
        >
          <option value="__novo__">+ Novo empreendimento</option>
          {Object.keys(saved).map((nome) => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field(
          'Nome do empreendimento',
          <input
            type="text"
            className={inputCls}
            value={regras.nomeEmpreendimento}
            onChange={(e) => setRegras({ ...regras, nomeEmpreendimento: e.target.value })}
          />,
        )}
        {field('Preço de tabela (R$)', num('precoTabela'))}
        {field('% máx. financiamento Caixa', num('percentualMaxFinanciamento'))}
        {field('Valor de cada intermediária (R$)', num('intermediariaValor'))}
        {field('Quantidade de intermediárias', num('intermediariaQuantidade'))}
        {field(
          'Cadência das intermediárias',
          <select
            className={inputCls}
            value={regras.intermediariaCadencia}
            onChange={(e) =>
              setRegras({ ...regras, intermediariaCadencia: e.target.value as Regras['intermediariaCadencia'] })
            }
          >
            <option value="mensal">Mensal</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>,
        )}
        {field(
          'Data da primeira intermediária',
          <input
            type="date"
            className={inputCls}
            value={regras.intermediariaPrimeiraData}
            onChange={(e) => setRegras({ ...regras, intermediariaPrimeiraData: e.target.value })}
          />,
        )}
        {field('Parcelas INC', num('parcelasINC'))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Salvar regras deste empreendimento
        </button>
        {feedback && (
          <span className={`text-xs ${feedback.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
            {feedback}
          </span>
        )}
      </div>
    </section>
  )
}
