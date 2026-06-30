"use client";

import { useEffect, useState } from "react";
import {
  useConnection,
  useConnect,
  useDisconnect,
  useConnectors,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { shortenAddress } from "@/lib/eth";

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useConnection();
  const connectors = useConnectors();
  const {
    mutateAsync: connect,
    isPending,
    error: connectError,
    reset,
  } = useConnect();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const wrongNetwork = isConnected && chainId !== sepolia.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  const metaMaskConnector =
    connectors.find((c) => c.id === "metaMaskSDK") ??
    connectors.find((c) => c.id === "io.metamask") ??
    connectors.find((c) => c.name.toLowerCase().includes("metamask")) ??
    connectors[0];

  const handleConnect = async () => {
    reset();
    if (!metaMaskConnector) {
      window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await connect({
        connector: metaMaskConnector,
        chainId: sepolia.id,
      });
    } catch {
      // Error surfaced via connectError
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full bg-amber-600/50 px-4 py-2 text-sm font-medium text-white"
      >
        Connect MetaMask
      </button>
    );
  }

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
          disabled={isDisconnecting}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleConnect}
        disabled={isPending}
        className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
      >
        {isPending ? "Connecting..." : "Connect MetaMask"}
      </button>
      {connectError && (
        <p className="max-w-xs text-right text-xs text-red-400">
          {connectError.message.includes("User rejected")
            ? "Connection rejected in MetaMask."
            : connectError.message.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
