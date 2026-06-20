import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Regras {
  nomeEmpreendimento: string
  precoTabela: number
  percentualMaxFinanciamento: number
  intermediariaValor: number
  intermediariaQuantidade: number
  intermediariaCadencia: 'mensal' | 'semestral' | 'anual'
  intermediariaPrimeiraData: string
  parcelasINC: number
}

interface LaudoExtraido {
  nomeCliente: string | null
  valorAvaliacao: number | null
  financiamentoAprovado: number | null
  prazoMeses: number | null
  taxaJuros: string | null
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function calcularFluxo(laudo: LaudoExtraido, regras: Regras): string {
  const valorAvaliacao = laudo.valorAvaliacao ?? 0
  const financiamentoAprovado = laudo.financiamentoAprovado ?? 0

  const financiamentoEfetivo = Math.min(
    financiamentoAprovado,
    valorAvaliacao * (regras.percentualMaxFinanciamento / 100),
  )

  const saldoDevedor = regras.precoTabela - financiamentoEfetivo
  const totalIntermediarias = regras.intermediariaQuantidade * regras.intermediariaValor
  const saldoParcelamento = saldoDevedor - totalIntermediarias
  const parcelaINC = regras.parcelasINC > 0 ? saldoParcelamento / regras.parcelasINC : 0

  const primeiraData = new Date(regras.intermediariaPrimeiraData + 'T12:00:00')

  const intervalos: Record<'mensal' | 'semestral' | 'anual', number> = {
    mensal: 1,
    semestral: 6,
    anual: 12,
  }
  const intervaloMeses = intervalos[regras.intermediariaCadencia]

  const linhasIntermediarias: string[] = []
  for (let i = 0; i < regras.intermediariaQuantidade; i++) {
    const data = addMonths(primeiraData, i * intervaloMeses)
    const num = String(i + 1).padStart(2, '0')
    linhasIntermediarias.push(`${num} — ${formatDate(data)}:   R$ ${formatBRL(regras.intermediariaValor)}`)
  }

  const nomeCliente = laudo.nomeCliente ?? 'Não identificado'
  const empreendimento = regras.nomeEmpreendimento.toUpperCase()

  const linhas = [
    `FLUXO DE PAGAMENTO — ${empreendimento}`,
    `Cliente: ${nomeCliente}`,
    '',
    `Valor de Tabela:            R$ ${formatBRL(regras.precoTabela)}`,
    `Valor de Avaliação:         R$ ${formatBRL(valorAvaliacao)}`,
    `Financiamento Caixa:        R$ ${formatBRL(financiamentoEfetivo)}`,
    `Saldo Devedor (Pró-Soluto): R$ ${formatBRL(saldoDevedor)}`,
    '',
    'INTERMEDIÁRIAS',
    ...linhasIntermediarias,
    '',
    'PARCELAMENTO INC',
    `${regras.parcelasINC}x de R$ ${formatBRL(parcelaINC)}/mês`,
    `(Saldo parcelado: R$ ${formatBRL(saldoParcelamento)})`,
    '',
    '────────────────────────────',
    `Total Pró-Soluto:   R$ ${formatBRL(saldoDevedor)}`,
  ]

  return linhas.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { laudoTexto, laudoImagem, mimeType, regras } = body as {
      laudoTexto?: string
      laudoImagem?: string
      mimeType?: string
      regras: Regras
    }

    const promptSistema =
      'Você é um assistente especializado em laudos de financiamento imobiliário brasileiro. ' +
      'Analise o conteúdo e extraia os dados disponíveis. ' +
      'Retorne APENAS JSON válido, sem texto adicional, sem markdown: ' +
      '{ "nomeCliente": string | null, "valorAvaliacao": number | null, "financiamentoAprovado": number | null, "prazoMeses": number | null, "taxaJuros": string | null } ' +
      'Se algum campo não estiver disponível, use null.'

    let content: Anthropic.MessageParam['content']

    if (laudoImagem && mimeType) {
      content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: laudoImagem,
          },
        },
        { type: 'text', text: promptSistema },
      ]
    } else {
      content = `${promptSistema}\n\nLAUDO:\n${laudoTexto ?? ''}`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const laudo: LaudoExtraido = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    const fluxo = calcularFluxo(laudo, regras)

    return NextResponse.json({ fluxo, laudo })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao gerar fluxo' }, { status: 500 })
  }
}
