import { useState } from 'react'
import { useCantonWallet } from './useCantonWallet'

export default function App() {
  const {
    state, account, error, txResult, txLoading,
    connect, disconnect, submitTransaction, queryContracts,
  } = useCantonWallet()
  const [contracts, setContracts] = useState<any>(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const handleQuery = async () => {
    setQueryLoading(true)
    const result = await queryContracts()
    setContracts(result)
    setQueryLoading(false)
  }
  return (
    <div style={css.root}>
      <div style={css.grid} />
      <div style={css.card}>
        <div style={css.header}>
          <div style={css.logo}>
            <span style={css.logoText}>Canton</span>
          </div>
          <span style={css.badge}>dApp SDK Demo</span>
        </div>
        <div style={css.body}>
          {state === 'idle' && (
            <div style={css.center}>
              <p style={css.hint}>
                Connect any Canton wallet using the dApp SDK.
                <br /><br />
                Connect any Canton wallet using the <code style={css.code}>dApp SDK.</code><br /><br />              </p>
              <button style={css.btn} onClick={connect}>
                Connect Wallet
              </button>
            </div>
          )}
          {state === 'connecting' && (
            <div style={css.center}>
              <div style={css.waiting}>
                <span style={css.pulse} />
                Opening wallet picker…
              </div>
              <p style={css.subtext}>
                Select your Canton wallet to continue.
              </p>
            </div>
          )}
          {state === 'error' && (
            <div style={css.center}>
              <div style={css.errorBox}>{error}</div>
              <button style={css.btn} onClick={connect}>Retry</button>
            </div>
          )}
          {state === 'connected' && account && (
            <div>
              <div style={css.connectedRow}>
                <span style={css.connectedDot} />
                <span style={css.connectedText}>Connected</span>
                <span style={css.networkBadge}>{account.networkId}</span>
              </div>
              <div style={css.table}>
                {([
                  ['Party ID', account.partyId, '#63B3ED'],
                  ['Network', account.networkId, '#e2e8f0'],
                  ['Status', account.status, '#68D391'],
                  ['Signing', account.signingProviderId, '#e2e8f0'],
                ] as [string, string, string][]).map(([k, v, color]) => (
                  <div key={k} style={css.row}>
                    <span style={css.key}>{k}</span>
                    <span style={{ ...css.val, color }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={css.actions}>
                <button
                  style={css.actionBtn}
                  onClick={submitTransaction}
                  disabled={txLoading}
                >
                  {txLoading ? 'Signing…' : 'Send Transaction'}
                </button>
                <button
                  style={{ ...css.actionBtn, ...css.actionBtnSecondary }}
                  onClick={handleQuery}
                  disabled={queryLoading}
                >
                  {queryLoading ? 'Querying…' : 'Query Contracts'}
                </button>
                <button
                  style={{ ...css.actionBtn, ...css.actionBtnGhost }}
                  onClick={disconnect}
                >
                  Disconnect
                </button>
              </div>
              {txResult && (
                <div style={css.resultBox}>
                  <div style={css.resultTitle}>✓ Transaction Confirmed</div>
                  <div style={css.resultRow}>
                    <span style={css.resultKey}>method</span>
                    <span style={css.resultVal}>sdk.prepareExecuteAndWait()</span>
                  </div>
                  <div style={css.resultRow}>
                    <span style={css.resultKey}>status</span>
                    <span style={{ ...css.resultVal, color: '#68D391' }}>{txResult.status}</span>
                  </div>
                  <div style={css.resultRow}>
                    <span style={css.resultKey}>updateId</span>
                    <span style={css.resultVal}>{txResult.updateId}</span>
                  </div>
                  <div style={css.resultRow}>
                    <span style={css.resultKey}>commandId</span>
                    <span style={css.resultVal}>{txResult.commandId}</span>
                  </div>
                </div>
              )}
              {contracts !== null && (
                <div style={{ ...css.resultBox, borderColor: 'rgba(99,179,237,0.2)', background: 'rgba(99,179,237,0.05)' }}>
                  <div style={{ ...css.resultTitle, color: '#63B3ED' }}>Active Contracts</div>
                  <pre style={css.pre}>
                    {JSON.stringify(contracts, null, 2).slice(0, 300)}
                    {JSON.stringify(contracts, null, 2).length > 300 ? '\n…' : ''}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const css: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#060910',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
  },
  card: {
    width: 480, background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
    overflow: 'hidden', position: 'relative', zIndex: 1,
  },
  header: {
    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'baseline', gap: 4 },
  logoC: { fontSize: 28, fontWeight: 800, color: '#63B3ED', letterSpacing: -1, lineHeight: 1 },
  logoText: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', letterSpacing: 4 },
  badge: { fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 },
  body: { padding: 28, minHeight: 220 },
  center: { display: 'flex', flexDirection: 'column', gap: 16 },
  hint: { fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 },
  code: { fontFamily: 'monospace', fontSize: 12, color: '#63B3ED', background: 'rgba(99,179,237,0.1)', padding: '2px 6px', borderRadius: 4 },
  btn: { padding: '12px 28px', background: '#63B3ED', color: '#060910', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' },
  waiting: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  pulse: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#63B3ED' },
  subtext: { fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7, margin: 0 },
  errorBox: { fontSize: 13, color: '#FC8181', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', borderRadius: 8, padding: '10px 14px' },
  connectedRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  connectedDot: { width: 8, height: 8, borderRadius: '50%', background: '#68D391', boxShadow: '0 0 8px #68D391' },
  connectedText: { fontSize: 13, fontWeight: 600, color: '#68D391', flex: 1 },
  networkBadge: { fontFamily: 'monospace', fontSize: 11, color: '#63B3ED', background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)', padding: '3px 10px', borderRadius: 100 },
  table: { borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 },
  row: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 16 },
  key: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5, flexShrink: 0 },
  val: { fontFamily: 'monospace', fontSize: 11, textAlign: 'right' as const, wordBreak: 'break-all' as const },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 16 },
  actionBtn: { padding: '9px 18px', background: '#63B3ED', color: '#060910', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  actionBtnSecondary: { background: 'rgba(99,179,237,0.1)', color: '#63B3ED', border: '1px solid rgba(99,179,237,0.2)' },
  actionBtnGhost: { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' },
  resultBox: { background: 'rgba(104,211,145,0.05)', border: '1px solid rgba(104,211,145,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 12 },
  resultTitle: { fontSize: 12, fontWeight: 700, color: '#68D391', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 8 },
  resultRow: { display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  resultKey: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, flexShrink: 0 },
  resultVal: { fontFamily: 'monospace', fontSize: 11, color: '#e2e8f0', textAlign: 'right' as const, wordBreak: 'break-all' as const },
  pre: { fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, margin: 0, overflowX: 'auto' as const },
  footer: { padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' },
}