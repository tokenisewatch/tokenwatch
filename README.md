# TokenWatch — Luxury Watch RWA Platform

A minimal Real World Asset (RWA) demo where a platform tokenizes luxury watches into investment shares on **Ethereum Sepolia**. Investors buy shares with ETH; when the watch is sold, sale proceeds are distributed proportionally on-chain.

## RWA Workflow

```
Watch Owner → Platform acquires watch (simulated off-chain)
     ↓
Admin registers watch on-chain (WatchVault.sol)
     ↓
Investment shares minted (internal ledger)
     ↓
Investors buy shares via MetaMask + ETH
     ↓
Platform sells watch → admin deposits sale ETH to contract
     ↓
Investors claim proportional revenue
```

## System Architecture

```
                  Frontend (Next.js)

        +-------------------------+
        |     Admin Dashboard     |
        |     Investor Portal     |
        +-----------+-------------+
                    |
             MetaMask Wallet
                    |
               viem (via wagmi)
                    |
         Transactions & View Reads
                    |
        ==============================
           Ethereum Sepolia Testnet
        ==============================
                    |
            +----------------+
            | WatchVault.sol |
            +----------------+
            | Watch Registry |
            | Share Ledger   |
            | Revenue Payout |
            +----------------+
                    |
          Events & View Functions
                    |
                    ▼
             Frontend Refresh
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Wallet | MetaMask |
| Blockchain library | wagmi + viem |
| Smart contracts | Solidity 0.8.24, Hardhat, OpenZeppelin |
| Network | Ethereum Sepolia |
| Deployment | Vercel (frontend), Hardhat (contracts) |

## Smart Contract — WatchVault.sol

Single contract with three responsibilities:

- **Watch Registry** — `registerWatch`, `getWatch`, `getWatchCount`
- **Share Ledger** — `buyShares`, `remainingShares`, `sharePrice`
- **Revenue Distribution** — `sellWatch`, `claimRevenue`, `claimableAmount`, `withdrawPlatformRevenue`

Admin functions are gated by `Ownable` (deployer wallet).

### Events

- `WatchRegistered`
- `SharesPurchased`
- `WatchSold`
- `RevenueClaimed`

The frontend subscribes to these events via wagmi and refreshes UI state.

## Project Structure

```
tokenwatch/
├── app/                  # Next.js pages
├── components/           # UI components
├── hooks/                # Contract hooks
├── lib/                  # wagmi config, ABI, helpers
├── contracts/            # WatchVault.sol
├── test/                 # Hardhat tests
├── scripts/deploy.ts     # Deploy + copy ABI
└── hardhat.config.ts
```

## Environment Variables

Copy `.env.example` to `.env` and `.env.local`:

| Variable | Used by | Description |
|----------|---------|-------------|
| `SEPOLIA_RPC_URL` | Hardhat | Sepolia RPC endpoint |
| `PRIVATE_KEY` | Hardhat | Deployer wallet private key |
| `ETHERSCAN_API_KEY` | Hardhat | For contract verification |
| `NEXT_PUBLIC_WATCH_VAULT_ADDRESS` | Next.js | Deployed WatchVault address |

## Local Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run contract tests (8 tests)
npm run test:contract

# Deploy to local Hardhat network (copies ABI to lib/abi/)
npx hardhat run scripts/deploy.ts

# Set contract address in .env.local, then start frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Sepolia

```bash
# 1. Configure .env with SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
npm run compile
npm run test:contract
npm run deploy:sepolia

# 2. Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# 3. Add address to .env.local
NEXT_PUBLIC_WATCH_VAULT_ADDRESS=<CONTRACT_ADDRESS>

# 4. Deploy frontend to Vercel (repo root, set env var in dashboard)
npm run build
```

## Deploy Frontend to Vercel

- **Root directory:** repository root
- **Build command:** `npm run build`
- **Environment variable:** `NEXT_PUBLIC_WATCH_VAULT_ADDRESS`

## Demo Checklist

1. Show verified contract on [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Connect MetaMask (Sepolia network)
3. Admin: register a watch
4. Investor: buy shares
5. View portfolio
6. Admin: sell watch (deposit ETH)
7. Investor: claim revenue
8. Show transactions on Etherscan

## Links (fill in after deployment)

| Resource | URL |
|----------|-----|
| Verified contract | `TBD` |
| Live frontend | `TBD` |
| Demo video | `TBD` |

## License

MIT — University project demo.
