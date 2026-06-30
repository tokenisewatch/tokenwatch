"use client";

import { WatchCard } from "@/components/WatchCard";
import { useAllWatches } from "@/hooks/useWatchVault";
import { WATCH_VAULT_ADDRESS } from "@/lib/contract";

export function HomeContent() {
  const { data: watches, isLoading, error } = useAllWatches();

  const noContract =
    WATCH_VAULT_ADDRESS === "0x0000000000000000000000000000000000000000";

  return (
    <div>
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Luxury Watches
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Invest in fractional shares of tokenized luxury watches. When the
          platform sells a watch, proceeds are distributed proportionally on
          Ethereum Sepolia.
        </p>
      </section>

      {noContract && (
        <div className="mb-8 rounded-xl border border-amber-600/30 bg-amber-600/10 px-4 py-3 text-sm text-amber-200">
          Set <code className="text-amber-100">NEXT_PUBLIC_WATCH_VAULT_ADDRESS</code>{" "}
          in <code className="text-amber-100">.env.local</code> after deploying the
          contract.
        </div>
      )}

      {isLoading && <p className="text-zinc-500">Loading watches...</p>}
      {error && (
        <p className="text-red-400">Failed to load watches: {error.message}</p>
      )}

      {watches && watches.length === 0 && !isLoading && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center">
          <p className="text-zinc-400">No watches listed yet.</p>
          <p className="mt-2 text-sm text-zinc-500">
            An admin can register the first watch from the Admin dashboard.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {watches?.map((watch) => (
          <WatchCard key={watch.id.toString()} watch={watch} />
        ))}
      </div>
    </div>
  );
}
