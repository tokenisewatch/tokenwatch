"use client";

import { useEffect } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { shortenAddress } from "@/lib/eth";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const metaMask = connectors[0];
  const wrongNetwork = isConnected && chainId !== sepolia.id;

  useEffect(() => {
    if (wrongNetwork && switchChain) {
      switchChain({ chainId: sepolia.id });
    }
  }, [wrongNetwork, switchChain]);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {wrongNetwork && (
          <button
            type="button"
            onClick={() => switchChain?.({ chainId: sepolia.id })}
            disabled={isSwitching}
            className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200 hover:bg-amber-500/20"
          >
            Switch to Sepolia
          </button>
        )}
        <span className="hidden text-sm text-zinc-400 sm:inline">
          {shortenAddress(address)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => metaMask && connect({ connector: metaMask })}
      disabled={isPending || !metaMask}
      className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
    >
      {isPending ? "Connecting..." : "Connect MetaMask"}
    </button>
  );
}
