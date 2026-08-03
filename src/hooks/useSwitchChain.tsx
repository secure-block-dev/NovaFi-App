import { useCallback } from "react";
import { useSwitchChain as useWagmiSwitchChain } from "wagmi";

/**
 * Switches the wallet to the given chain. If the wallet doesn't have the
 * chain added yet, wagmi automatically sends wallet_addEthereumChain
 * (the chain must be declared in src/config/wagmi.ts).
 */
export function useSwitchChain() {
  const { switchChainAsync } = useWagmiSwitchChain();

  // Stable identity so consumers (e.g. NetworkGuard's auto-switch effect) can
  // safely depend on this function without re-running on every render.
  return useCallback(
    async (desiredChain: number) => {
      try {
        await switchChainAsync({ chainId: desiredChain });
      } catch (err: any) {
        // 4001 / UserRejectedRequestError: user cancelled in the wallet — not a real error
        if (err?.code !== 4001 && err?.name !== "UserRejectedRequestError") {
          console.error("switchChain failed:", err);
        }
      }
    },
    [switchChainAsync]
  );
}
