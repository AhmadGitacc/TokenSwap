# AhmadSwap

A decentralized token swapping application built on Ethereum, providing seamless token exchanges with real-time price quotes and intuitive user experience.

## Features

- 🔄 **Token Swapping** - Swap ERC-20 tokens on Ethereum network
- 💰 **Real-time Price Quotes** - Get live pricing information before swapping
- 📊 **Price Viewing** - Monitor token prices and market data
- 🔗 **Wallet Integration** - Connect with popular wallets via WalletConnect
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum
- **Wallet Connection**: RainbowKit, wagmi, WalletConnect (Reown Cloud)
- **DEX Integration**: 0x API
- **Image Optimization**: Next.js Image component

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Ethereum wallet

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ahmadswap.git
cd ahmadswap
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Add your environment variables:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_0X_API_KEY=your_0x_api_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button and select your preferred wallet
2. **Select Tokens**: Choose the tokens you want to swap from and to
3. **Enter Amount**: Input the amount you wish to swap
4. **Get Quote**: View the real-time price quote and exchange rate
5. **Execute Swap**: Confirm the transaction in your wallet

## Configuration

### Adding New Tokens

Tokens are configured in the `MAINNET_TOKENS_BY_SYMBOL` object. To add new tokens:

```javascript
MAINNET_TOKENS_BY_SYMBOL['TOKEN_SYMBOL'] = {
  address: '0x...',
  symbol: 'TOKEN_SYMBOL',
  name: 'Token Name',
  decimals: 18,
  logoURI: 'https://...'
}
```


## API Integration

This project integrates with:
- **0x API**: For fetching quotes and executing swaps
- **WalletConnect (Reown Cloud)**: For wallet connectivity

## Roadmap

- [ ] Multi-chain support (Polygon, BSC, Arbitrum)
- [ ] Advanced trading features (limit orders, stop-loss)
- [ ] Portfolio tracking
- [ ] Historical price charts
- [ ] Liquidity pool information


## Disclaimer!!!!

This is experimental software. Use at your own risk. Always verify transactions before confirming swaps.

---

