/**
 * Security and error handling for signing flows (swap / liquidity).
 * No dependencies: testable in isolation.
 */

/**
 * Hard pre-signing guard: queries the wallet's REAL network right before
 * signing, instead of trusting UI state (which can be out of sync for a
 * few milliseconds if the user switches networks mid-flow).
 * Throws an error with code WRONG_NETWORK that describeTxError knows how to translate.
 */
export async function assertChainBeforeSigning(
  provider: { getNetwork: () => Promise<{ chainId: number }> },
  expectedChainId: number
): Promise<void> {
  const net = await provider.getNetwork();
  if (net.chainId !== expectedChainId) {
    const err = new Error("Wallet is not on the expected network") as Error & { code: string };
    err.code = "WRONG_NETWORK";
    throw err;
  }
}

/**
 * Translates any wallet/RPC/contract error into a clear message for the
 * user. Covers EIP-1193 codes (4001, -32002), ethers v5 codes
 * (ACTION_REJECTED, INSUFFICIENT_FUNDS, …) and PancakeSwap reverts.
 */
export function describeTxError(err: any): string {
  const code = err?.code;
  const innerCode = err?.error?.code ?? err?.data?.code;
  const msg: string =
    err?.error?.message || err?.reason || err?.shortMessage || err?.message || "";

  // Wrong network detected by the pre-signing guard
  if (code === "WRONG_NETWORK")
    return "Wallet is on the wrong network — switch to BNB Chain and try again";

  // User cancelled in the wallet (EIP-1193 4001 / ethers v5)
  if (code === 4001 || innerCode === 4001 || code === "ACTION_REJECTED")
    return "Transaction cancelled";

  // A request is already pending in the wallet (EIP-1193 -32002)
  if (code === -32002 || innerCode === -32002 || /already pending/i.test(msg))
    return "A request is already pending in your wallet — open it to continue";

  // Not enough funds for amount + gas
  if (code === "INSUFFICIENT_FUNDS" || /insufficient funds/i.test(msg))
    return "Insufficient funds for amount + gas";

  // PancakeSwap reverts from price movement / slippage
  if (/INSUFFICIENT_OUTPUT_AMOUNT|INSUFFICIENT_A_AMOUNT|INSUFFICIENT_B_AMOUNT|EXCESSIVE_INPUT_AMOUNT/.test(msg))
    return "Price moved too much — try increasing slippage";

  // Transaction deadline expired
  if (/EXPIRED/.test(msg))
    return "Transaction deadline expired — try again";

  // Simulation indicates the tx would revert
  if (code === "UNPREDICTABLE_GAS_LIMIT" || code === "CALL_EXCEPTION")
    return "Transaction would fail — check amounts and allowances, then try again";

  // RPC down or unresponsive
  if (code === "NETWORK_ERROR" || code === "TIMEOUT" || /timeout|network error/i.test(msg))
    return "Network error — the RPC did not respond, please try again";

  return err?.shortMessage || err?.reason || err?.message || "Transaction failed";
}
