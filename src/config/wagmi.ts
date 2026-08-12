import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  walletConnectWallet,
  coinbaseWallet,
  trustWallet,
  okxWallet,
  binanceWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { fallback, http } from "wagmi";
import { arbitrum, avalanche, base, bsc, mainnet, optimism, polygon } from "wagmi/chains";

// WalletConnect (QR / mobile) needs a real projectId from https://cloud.reown.com
// Without it, injected wallets (EIP-6963) still work fine.
const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID || "novafi-dev-placeholder";

// Public BSC RPCs in order of preference: if one fails or times out,
// viem automatically falls back to the next one.
const BSC_RPCS = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
];

export const wagmiConfig = getDefaultConfig({
  appName: "NovaFi",
  projectId: WC_PROJECT_ID,
  // Wallets can connect on popular EVM networks. The app's DEX logic still relies
  // on BSC contract addresses, but the wallet layer is now broad enough for standard
  // multi-chain wallet usage without blocking users onto BNB-only.
  chains: [bsc, mainnet, polygon, arbitrum, optimism, avalanche, base],
  transports: {
    [bsc.id]: fallback(BSC_RPCS.map((url) => http(url, { timeout: 10_000 }))),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [avalanche.id]: http(),
    [base.id]: http(),
  },
  // Explicit list WITHOUT metaMaskWallet: that connector pulls in @metamask/sdk,
  // whose analytics module breaks under webpack/CRA ("import_openapi_fetch.default
  // is not a function"). MetaMask and any other extension are still detected
  // automatically via EIP-6963 (wagmi's native multi-provider discovery, independent
  // of this `wallets` list) and merged into the modal by RainbowKit; MetaMask mobile
  // still connects through the WalletConnect QR.
  // `injectedWallet` ("Browser Wallet") is back as a deliberate fallback: it's the
  // only entry that can reach a wallet exposing plain `window.ethereum` without an
  // EIP-6963 announcement (older or less-maintained extensions), which otherwise
  // wouldn't appear anywhere in the modal. Trade-off (verified in RainbowKit's
  // source): this tile always renders regardless of whether any extension is
  // installed, and connecting fails with no fallback (no QR, no install link) if
  // the user clicks it with nothing injected — this is exactly why it was removed
  // earlier. Kept anyway per product decision: covering the EIP-6963 gap outweighs
  // the occasional no-op click for users without any injected wallet.
  wallets: [
    {
      groupName: "Recommended",
      wallets: [walletConnectWallet],
    },
    {
      groupName: "More wallets",
      wallets: [okxWallet, binanceWallet, coinbaseWallet, trustWallet, injectedWallet],
    },
  ],
});
