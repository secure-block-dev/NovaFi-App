import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useSwitchChain } from "../hooks/useSwitchChain";
import { BSC_CHAIN_ID } from "../constants/contracts";

/**
 * Auto-prompts a switch to BSC right after a wallet connects on the wrong
 * chain, instead of waiting for the user to find and click the "Wrong
 * network" button. Runs once per (isConnected, chainId) pair — if the user
 * rejects the wallet's switch prompt, this won't re-fire on its own; the
 * "Wrong network" button remains as a manual retry.
 *
 * This is deliberately a separate, post-connect effect rather than an
 * `initialChain` forced during the connect handshake — the latter hits an
 * open wagmi v2 bug (wevm/wagmi#4118) where connectAsync can hang forever
 * when the wallet isn't already on the requested chain.
 */
export function NetworkGuard() {
  const { isConnected, chainId } = useAccount();
  const switchChain = useSwitchChain();
  const attemptedFor = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isConnected || chainId === undefined || chainId === BSC_CHAIN_ID) {
      return;
    }
    if (attemptedFor.current === chainId) return;
    attemptedFor.current = chainId;
    switchChain(BSC_CHAIN_ID);
  }, [isConnected, chainId, switchChain]);

  return null;
}

export default NetworkGuard;
