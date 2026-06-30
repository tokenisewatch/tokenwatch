"use client";

import { sepolia } from "wagmi/chains";
import { useChainId, useSwitchChain } from "wagmi";

export function NetworkBadge() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const onSepolia = chainId === sepolia.id;

  return (
    <button
      type="button"
      onClick={() => !onSepolia && switchChain?.({ chainId: sepolia.id })}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 disabled:opacity-50"
      title={onSepolia ? "Connected to Sepolia" : "Switch to Sepolia"}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-xs">
        ◆
      </span>
      Sepolia
      {!onSepolia && (
        <span className="text-xs text-amber-400">↻</span>
      )}
    </button>
  );
}
