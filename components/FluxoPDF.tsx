import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

const ORANGE = '#F04E23'
const ORANGE_LIGHT = '#FFF4F1'
const TEXT = '#1A1A1A'
const DIVIDER = '#F9B09A' // #F04E23 ~30% opacity on white

export interface FluxoPDFData {
  nomeEmpreendimento: string
  nomeCliente: string
  dataGeracao: string
  precoTabela: number
  valorAvaliacao: number
  limiteFinanciamento: number
  financiamentoEfetivo: number
  saldoDevedor: number
  avisoLimite: string | null
  intermediarias: { numero: string; data: string; valor: number }[]
  totalIntermediarias: number
  parcelasINC: number
  parcelaINC: number
  saldoParcelamento: number
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', fontSize: 9, color: TEXT },
  header: { backgroundColor: ORANGE, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerLogo: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Helvetica-Bold' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 10 },
  body: { padding: 28 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  metaLabel: { color: '#555', fontSize: 8 },
  metaValue: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  divider: { borderBottomWidth: 1, borderBottomColor: DIVIDER, marginVertical: 12 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', color: ORANGE, fontSize: 9, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#555' },
  value: { fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: ORANGE, color: '#FFF', padding: '4 6', marginBottom: 2, borderRadius: 2 },
  tableHeaderCell: { color: '#FFF', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tableRow: { flexDirection: 'row', padding: '3 6', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tableCell: { fontSize: 8 },
  colNum: { width: '10%' },
  colData: { width: '45%' },
  colValor: { width: '45%', textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: ORANGE_LIGHT, padding: '8 10', borderRadius: 4, marginTop: 8 },
  totalLabel: { fontFamily: 'Helvetica-Bold', color: ORANGE, fontSize: 10 },
  totalValue: { fontFamily: 'Helvetica-Bold', color: ORANGE, fontSize: 10 },
  avisoBox: { backgroundColor: '#FFF3CD', borderLeftWidth: 3, borderLeftColor: '#F0A500', padding: '6 10', marginTop: 6, borderRadius: 2 },
  avisoText: { color: '#7A5000', fontSize: 8 },
  footer: { borderTopWidth: 1.5, borderTopColor: ORANGE, padding: '10 28', marginTop: 'auto' },
  footerText: { color: '#999', fontSize: 7, textAlign: 'center', marginBottom: 2 },
})

export default function FluxoPDF({ data }: { data: FluxoPDFData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.headerLogo}>INC Empreendimentos</Text>
          <Text style={s.headerSub}>Fluxo de Pagamento</Text>
        </View>

        {/* BODY */}
        <View style={s.body}>
          {/* Meta */}
          <View style={s.metaRow}>
            <View>
              <Text style={s.metaLabel}>Empreendimento</Text>
              <Text style={s.metaValue}>{data.nomeEmpreendimento}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.metaLabel}>Data</Text>
              <Text style={s.metaValue}>{data.dataGeracao}</Text>
            </View>
          </View>
          <View style={[s.metaRow, { marginTop: 6 }]}>
            <View>
              <Text style={s.metaLabel}>Cliente</Text>
              <Text style={s.metaValue}>{data.nomeCliente || 'Não identificado'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.metaLabel}>Gerente</Text>
              <Text style={s.metaValue}>Samuel Micucci</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Resumo Financeiro */}
          <Text style={s.sectionTitle}>Resumo Financeiro</Text>
          {[
            ['Valor de Tabela', data.precoTabela],
            ['Valor de Avaliação', data.valorAvaliacao],
            [`Limite Financiamento (${Math.round((data.limiteFinanciamento / data.valorAvaliacao) * 100) || 80}%)`, data.limiteFinanciamento],
            ['Financiamento Efetivo Caixa', data.financiamentoEfetivo],
            ['Saldo Devedor (Pró-Soluto)', data.saldoDevedor],
          ].map(([label, val]) => (
            <View key={label as string} style={s.row}>
              <Text style={s.label}>{label as string}</Text>
              <Text style={s.value}>R$ {formatBRL(val as number)}</Text>
            </View>
          ))}
          {data.avisoLimite && (
            <View style={s.avisoBox}>
              <Text style={s.avisoText}>{data.avisoLimite}</Text>
            </View>
          )}

          <View style={s.divider} />

          {/* Intermediárias */}
          <Text style={s.sectionTitle}>Intermediárias</Text>
          <View style={s.tableHeader}>
            <Text style={[s.tableHeaderCell, s.colNum]}>Nº</Text>
            <Text style={[s.tableHeaderCell, s.colData]}>Data</Text>
            <Text style={[s.tableHeaderCell, s.colValor, { textAlign: 'right' }]}>Valor</Text>
          </View>
          {data.intermediarias.map((i) => (
            <View key={i.numero} style={s.tableRow}>
              <Text style={[s.tableCell, s.colNum]}>{i.numero}</Text>
              <Text style={[s.tableCell, s.colData]}>{i.data}</Text>
              <Text style={[s.tableCell, s.colValor]}>R$ {formatBRL(i.valor)}</Text>
            </View>
          ))}
          <View style={[s.row, { marginTop: 6 }]}>
            <Text style={s.label}>Total intermediárias</Text>
            <Text style={s.value}>R$ {formatBRL(data.totalIntermediarias)}</Text>
          </View>

          <View style={s.divider} />

          {/* Parcelamento INC */}
          <Text style={s.sectionTitle}>Parcelamento INC</Text>
          <View style={s.row}>
            <Text style={s.label}>{data.parcelasINC}x de</Text>
            <Text style={s.value}>R$ {formatBRL(data.parcelaINC)}/mês</Text>
          </View>
          <View style={s.row}>
            <Text style={s.label}>Saldo parcelado</Text>
            <Text style={s.value}>R$ {formatBRL(data.saldoParcelamento)}</Text>
          </View>

          <View style={s.divider} />

          {/* Total */}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TOTAL PRÓ-SOLUTO</Text>
            <Text style={s.totalValue}>R$ {formatBRL(data.saldoDevedor)}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={s.footer}>
          <Text style={s.footerText}>Documento gerado pelo sistema INC Fluxo</Text>
          <Text style={s.footerText}>Este documento é informativo e não constitui proposta formal.</Text>
        </View>
      </Page>
    </Document>
  )
}
