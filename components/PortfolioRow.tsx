"use client";

import { formatEth } from "@/lib/eth";
import {
  ownershipPercent,
  watchStatus,
  type Watch,
} from "@/lib/contract";
import {
  useClaimRevenue,
  useClaimable,
  useMyShares,
} from "@/hooks/useWatchVault";

type PortfolioRowProps = {
  watch: Watch;
};

export function PortfolioRow({ watch }: PortfolioRowProps) {
  const { data: myShares } = useMyShares(watch.id);
  const { data: claimable } = useClaimable(watch.id);
  const { claimRevenue, isPending, isConfirming, isSuccess, error } =
    useClaimRevenue(watch.id);

  const shares = (myShares as bigint | undefined) ?? 0n;
  if (shares === 0n) return null;

  const status = watchStatus(watch);
  const claimableAmount = (claimable as bigint | undefined) ?? 0n;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-zinc-100">
            {watch.brand} {watch.model}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {shares.toString()} shares ·{" "}
            {ownershipPercent(shares, watch.totalShares)}% ownership
          </p>
          <p className="mt-1 text-sm text-zinc-500">Status: {status}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          {watch.sold && claimableAmount > 0n && (
            <>
              <p className="text-sm text-zinc-400">
                Claimable:{" "}
                <span className="font-medium text-amber-500">
                  {formatEth(claimableAmount)} ETH
                </span>
              </p>
              <button
                type="button"
                onClick={() => claimRevenue()}
                disabled={isPending || isConfirming}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
              >
                {isPending || isConfirming ? "Claiming..." : "Claim"}
              </button>
            </>
          )}
          {watch.sold && claimableAmount === 0n && (
            <p className="text-sm text-zinc-500">Revenue claimed</p>
          )}
          {isSuccess && (
            <p className="text-sm text-emerald-400">Claim successful!</p>
          )}
          {error && (
            <p className="text-sm text-red-400">{error.message.slice(0, 100)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
