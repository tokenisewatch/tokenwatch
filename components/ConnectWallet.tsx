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
      <button type="button" disabled className="btn-primary px-5 py-2.5 text-sm">
        Connect MetaMask
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {wrongNetwork && (
          <button
            type="button"
            onClick={() => switchChain?.({ chainId: sepolia.id })}
            disabled={isSwitching}
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300"
          >
            Switch network
          </button>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          disabled={isDisconnecting}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 py-1.5 pl-1.5 pr-3 transition hover:border-zinc-600"
        >
          <span className="avatar-gradient flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
            {address.slice(2, 4).toUpperCase()}
          </span>
          <span className="text-sm text-zinc-300">{shortenAddress(address)}</span>
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
        className="btn-primary px-5 py-2.5 text-sm shadow-lg shadow-orange-900/20"
      >
        {isPending ? "Connecting..." : "Connect MetaMask"}
      </button>
      {connectError && (
        <p className="max-w-[200px] text-right text-xs text-red-400">
          {connectError.message.includes("User rejected")
            ? "Connection rejected."
            : connectError.message.slice(0, 80)}
        </p>
      )}
    </div>
  );
}
