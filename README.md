# Canton dApp Demo

A minimal React dApp showing how to connect Canton wallets using the official [`@canton-network/dapp-sdk`](https://www.npmjs.com/package/@canton-network/dapp-sdk).

Built for the Canton Foundation DevRel video series.

## What This Shows

- Connecting to a Canton wallet using the dApp SDK
- The built-in wallet picker (CIP-103)
- `sdk.connect()` with a `RemoteAdapter` pointing at a local Wallet Gateway
- `sdk.listAccounts()` — fetching the Canton party ID
- `sdk.prepareExecuteAndWait()` — submitting a Daml transaction
- `sdk.ledgerApi()` — querying active contracts

## Stack

- React + TypeScript + Vite
- `@canton-network/dapp-sdk`
- `@walletconnect/sign-client` (peer dependency)

## Prerequisites

You need a running Canton Wallet Gateway. The easiest way locally:

```bash
npm install -g @canton-network/wallet-gateway-remote
```
and,

```bash
export WALLET_GATEWAY_ADMIN_SECRET=unsafe
wallet-gateway -c ./wallet-gateway.json
```

For a full local Canton setup including a Canton node and Mock OAuth2:

```bash
git clone https://github.com/canton-network/wallet-gateway.git
cd wallet-gateway
yarn install
yarn tsx scripts/src/fetch-canton.ts

# Terminal 1 — Canton node
.canton/.../bin/canton --config canton/devnet/canton.conf --bootstrap canton/devnet/bootstrap.sc --no-tty

# Terminal 2 — Mock OAuth2
yarn workspace @canton-network/mock-oauth2 start

# Terminal 3 — Wallet Gateway
export WALLET_GATEWAY_ADMIN_SECRET=unsafe
wallet-gateway -c ./wallet-gateway.json
```

## Setup

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`

## The Integration

All wallet connectivity is in `useCantonWallet.ts`:

```typescript
import * as sdk from '@canton-network/dapp-sdk'
import { RemoteAdapter } from '@canton-network/dapp-sdk'
await sdk.connect({
  additionalAdapters: [
    new RemoteAdapter({
      name: 'Canton Local',
      rpcUrl: 'http://localhost:3030/api/v0/dapp',
    }),
  ],
})

const accounts = await sdk.listAccounts()
await sdk.prepareExecuteAndWait({ commands: [...] })
await sdk.ledgerApi({ requestMethod: 'post', resource: '/v2/state/active-contracts', body: {...} })
```

## Architecture

```
Canton dApp (this repo)
    ↕ CIP-103 / dApp SDK
Wallet Gateway (localhost:3030)
    ↕ Ledger API + JWT auth
Canton Node (localhost:5003)
```

The Wallet Gateway handles authentication, signing, and Ledger API access.
Your dApp never touches JWT tokens or private keys.

## Links

- [All Wallet tools](https://dev-hub.canton.foundation/)
- [CIP-103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)