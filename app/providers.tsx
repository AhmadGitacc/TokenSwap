"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  trustWallet,
  rainbowWallet,
  walletConnectWallet, // ESSENTIAL for mobile
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const mainnet = {
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://cloudflare-eth.com'] },
    public: { http: ['https://cloudflare-eth.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' },
  },
};

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        walletConnectWallet, // This handles mobile deep linking
      ],
    },
    {
      groupName: "Other",
      wallets: [
        trustWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    appName: "swap-demo",
    projectId,
  }
);

// Use getDefaultConfig for better mobile support
const config = getDefaultConfig({
  appName: 'TekSwap',
  projectId,
  chains: [mainnet],
  connectors,
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}