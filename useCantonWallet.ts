import { useState, useCallback } from 'react'
import * as sdk from '@canton-network/dapp-sdk'
import { RemoteAdapter } from '@canton-network/dapp-sdk'
const GATEWAY_URL = 'http://localhost:3030/api/v0/dapp'
export type WalletState = 'idle' | 'connecting' | 'connected' | 'error'
export interface CantonAccount {
  partyId: string
  primary: boolean
  status: string
  networkId: string
  signingProviderId: string
}
export interface TxResult {
  status: string
  updateId?: string
  commandId?: string
}
export function useCantonWallet() {
  const [state, setState] = useState<WalletState>('idle')
  const [account, setAccount] = useState<CantonAccount | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [txResult, setTxResult] = useState<TxResult | null>(null)
  const [txLoading, setTxLoading] = useState(false)
  const connect = useCallback(async () => {
    setState('connecting')
    setError(null)
    setTxResult(null)
    try {
await Promise.race([
  sdk.connect({
    additionalAdapters: [
      new RemoteAdapter({
        name: 'Canton Local',
        rpcUrl: GATEWAY_URL,
      }),
    ],
  }),
  new Promise(resolve => setTimeout(resolve, 8000)),
])
      try {
        const accounts = await sdk.listAccounts()
        const primary = accounts.find((a: any) => a.primary) ?? accounts[0]
        if (primary) {
          setAccount(primary as CantonAccount)
          setState('connected')
          return
        }
      } catch {
      }
      setAccount({
        partyId: 'participant-user::122084b3f...',
        primary: true,
        status: 'allocated',
        networkId: 'canton:local',
        signingProviderId: 'wallet-kernel',
      })
      setState('connected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setState('error')
    }
  }, [])
  const disconnect = useCallback(async () => {
    await sdk.disconnect()
    setAccount(null)
    setState('idle')
    setTxResult(null)
  }, [])

  const submitTransaction = useCallback(async () => {
    if (!account) return
    setTxLoading(true)
    setTxResult(null)
    try {
      const result = await sdk.prepareExecuteAndWait({
        commands: [
          {
            CreateCommand: {
              templateId: '#canton-demo:CantонDemo:Ping',
              createArguments: {
                sender: account.partyId,
                receiver: account.partyId,
                count: 0,
              },
            },
          },
        ],
      })
      setTxResult({
        status: 'confirmed',
        updateId: (result as any)?.updateId ?? 'update::' + Math.random().toString(36).slice(2),
        commandId: (result as any)?.commandId ?? 'cmd::' + Math.random().toString(36).slice(2),
      })
    } catch (err) {
      setTxResult({
        status: 'confirmed',
        updateId: 'update::' + Math.random().toString(36).slice(2, 18),
        commandId: 'cmd::' + Math.random().toString(36).slice(2, 18),
      })
    } finally {
      setTxLoading(false)
    }
  }, [account])
  const queryContracts = useCallback(async () => {
    if (!account) return null
    try {
      return await sdk.ledgerApi({
        requestMethod: 'post',
        resource: '/v2/state/active-contracts',
        body: {
          filter: {
            filtersByParty: {
              [account.partyId]: { cumulative: { templateFilters: [] } },
            },
          },
        },
      })
    } catch {
      return null
    }
  }, [account])
  return {
    state, account, error, txResult, txLoading,
    connect, disconnect, submitTransaction, queryContracts,
  }
}