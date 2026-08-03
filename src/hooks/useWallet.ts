import { useMemo } from "react";
import { providers } from "ethers";
import { useAccount, useBalance, useConnectorClient } from "wagmi";
import { BSC_CHAIN_ID } from "../constants/contracts";

/**
 * Global wallet connection state — single source of truth for the app.
 *
 * wagmi → ethers v5 bridge: exposes the active connection with the same
 * shape ({ account, provider, chainId }) that useWeb3React used, so the
 * existing contract code (ethers v5) keeps working unchanged.
 * The wallet's accountsChanged / chainChanged events update these values
 * reactively (handled by wagmi).
 */
export function useWallet() {
  const { address, chainId, isConnected, isConnecting, isReconnecting } = useAccount();
  const { data: client } = useConnectorClient();

  // Native (BNB) balance of the connected account, refreshed every 15s.
  // react-query dedupes this: multiple components using useWallet share the query.
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address,
    query: { refetchInterval: 15_000 },
  });

  const provider = useMemo(() => {
    if (!client) return null;
    const network = client.chain
      ? { chainId: client.chain.id, name: client.chain.name }
      : undefined;
    // client.transport is an EIP-1193 provider (has .request)
    return new providers.Web3Provider(client.transport as any, network);
  }, [client]);

  return {
    account: (address as string | undefined) ?? null,
    chainId: chainId ?? null,
    provider,
    isConnected,
    /** true while connecting or restoring the session on page reload */
    isConnecting: isConnecting || isReconnecting,
    /** connected but off BSC — block write actions */
    isWrongNetwork: isConnected && chainId !== BSC_CHAIN_ID,
    /** formatted BNB balance (e.g. "0.4213") or null if no account */
    balance: balanceData ? balanceData.formatted : null,
    balanceSymbol: balanceData?.symbol ?? "BNB",
    balanceLoading,
  };
}
