"use client";

import { useConnection } from "wagmi";
import { PortfolioRow } from "@/components/PortfolioRow";
import { useAllWatches } from "@/hooks/useWatchVault";

export default function PortfolioPage() {
  const { isConnected } = useConnection();
  const { data: watches, isLoading } = useAllWatches();

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">My Investments</h1>
        <p className="mt-4 text-zinc-400">
          Connect MetaMask to view your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold text-zinc-100">
        My Investments
      </h1>
      <p className="mb-8 text-zinc-400">
        Your fractional watch holdings and claimable sale proceeds.
      </p>

      {isLoading && <p className="text-zinc-500">Loading portfolio...</p>}

      <div className="flex flex-col gap-4">
        {watches?.map((watch) => (
          <PortfolioRow key={watch.id.toString()} watch={watch} />
        ))}
      </div>

      {watches && watches.length > 0 && (
        <p className="mt-6 text-sm text-zinc-500">
          Only watches you own shares in appear above.
        </p>
      )}
    </div>
  );
}
