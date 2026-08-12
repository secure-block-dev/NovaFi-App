import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function SolanaWalletButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center">
      <WalletMultiButton
        className={[
          "!flex !items-center !justify-center !h-10 !min-w-[120px] !rounded-xl !border !border-white/10 !px-4 !py-2 !text-sm !font-semibold !text-white !shadow-sm !transition !duration-200 !hover:opacity-90",
          connected
            ? "!bg-gradient-to-r !from-fuchsia-500 !to-violet-600 !shadow-fuchsia-900/30"
            : "!bg-gradient-to-r !from-violet-500 !to-fuchsia-600 !shadow-violet-900/30",
        ].join(" ")}
        style={{
          fontFamily: "inherit",
          lineHeight: "1.2",
        }}
      >
        {connected && publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : "Solana"}
      </WalletMultiButton>
    </div>
  );
}

export default SolanaWalletButton;
