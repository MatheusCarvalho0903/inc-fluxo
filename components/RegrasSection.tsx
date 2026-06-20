'use client'

import { useEffect, useState } from 'react'

export interface Regras {
  nomeEmpreendimento: string
  precoTabela: number
  valorAvaliacao: number
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
  valorAvaliacao: 0,
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

  const inputCls =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-inc-primary focus:border-transparent w-full'

  function numField(label: string, key: keyof Regras, placeholder?: string) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <input
          type="number"
          className={inputCls}
          placeholder={placeholder}
          value={(regras[key] as number) || ''}
          onChange={(e) => setRegras({ ...regras, [key]: parseFloat(e.target.value) || 0 })}
        />
      </div>
    )
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-inc-text mb-4">Regras do Empreendimento</h2>

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
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Nome do empreendimento</label>
          <input
            type="text"
            className={inputCls}
            value={regras.nomeEmpreendimento}
            onChange={(e) => setRegras({ ...regras, nomeEmpreendimento: e.target.value })}
          />
        </div>

        {numField('Preço de tabela (R$)', 'precoTabela')}
        {numField('Valor de Avaliação (R$)', 'valorAvaliacao', 'Ex: 270000')}
        {numField('% máx. financiamento Caixa', 'percentualMaxFinanciamento')}
        {numField('Valor de cada intermediária (R$)', 'intermediariaValor')}
        {numField('Quantidade de intermediárias', 'intermediariaQuantidade')}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Cadência das intermediárias</label>
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
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Data da primeira intermediária</label>
          <input
            type="date"
            className={inputCls}
            value={regras.intermediariaPrimeiraData}
            onChange={(e) => setRegras({ ...regras, intermediariaPrimeiraData: e.target.value })}
          />
        </div>

        {numField('Parcelas INC', 'parcelasINC')}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="bg-inc-primary hover:bg-inc-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
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
