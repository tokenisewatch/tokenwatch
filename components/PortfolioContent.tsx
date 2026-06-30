"use client";

import Link from "next/link";
import { useState } from "react";
import { useConnection } from "wagmi";
import { writeContract } from "wagmi/actions";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatEth } from "@/lib/eth";
import {
  ownershipPercent,
  watchStatus,
  WATCH_VAULT_ABI,
  WATCH_VAULT_ADDRESS,
} from "@/lib/contract";
import { wagmiConfig } from "@/lib/wagmi";
import {
  usePortfolio,
  computePortfolioSummary,
  type Holding,
} from "@/hooks/usePortfolio";

function PortfolioTableRow({ holding }: { holding: Holding }) {
  const { watch, shares, sharePrice, currentValue, earnings, invested } =
    holding;
  const status = watchStatus(watch);
  const returnPct =
    invested > 0n ? Number((earnings * 10000n) / invested) / 100 : 0;

  return (
    <tr className="border-b border-zinc-800/60 hover:bg-zinc-900/40">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
            {watch.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={watch.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                —
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-zinc-100">
              {watch.brand} {watch.model}
            </p>
            <p className="text-xs text-zinc-500">
              {watch.model} · {watch.year.toString()}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-zinc-300">
        {shares.toString()}{" "}
        <span className="text-zinc-500">
          ({ownershipPercent(shares, watch.totalShares)}% of{" "}
          {watch.totalShares.toString()})
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-zinc-300">
        {formatEth(sharePrice)} ETH
      </td>
      <td className="px-4 py-4 text-sm font-medium text-zinc-100">
        {formatEth(currentValue)} ETH
      </td>
      <td className="px-4 py-4 text-sm">
        {watch.sold ? (
          <span className="text-emerald-400">
            +{formatEth(earnings)} ETH
            {returnPct > 0 && (
              <span className="ml-1 text-xs">+{returnPct.toFixed(1)}%</span>
            )}
          </span>
        ) : (
          <span className="text-zinc-500">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}

export function PortfolioContent() {
  const { isConnected } = useConnection();
  const { data: holdings, isLoading, refetch } = usePortfolio();
  const [claiming, setClaiming] = useState(false);

  if (!isConnected) {
    return (
      <div className="card px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-zinc-100">My Portfolio</h1>
        <p className="mt-4 text-zinc-500">
          Connect MetaMask to view your investments and earnings.
        </p>
      </div>
    );
  }

  const summary = holdings
    ? computePortfolioSummary(holdings)
    : {
        totalInvested: 0n,
        currentValue: 0n,
        totalEarnings: 0n,
        claimable: 0n,
        returnPct: 0,
      };

  const claimableHoldings = holdings?.filter((h) => h.claimable > 0n) ?? [];

  const handleClaimAll = async () => {
    setClaiming(true);
    try {
      for (const h of claimableHoldings) {
        await writeContract(wagmiConfig, {
          address: WATCH_VAULT_ADDRESS,
          abi: WATCH_VAULT_ABI,
          functionName: "claimRevenue",
          args: [h.watch.id],
        });
      }
      await refetch();
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          My Portfolio
        </h1>
        <p className="mt-2 text-zinc-500">
          View your investments and earnings from tokenized luxury watches.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard
              icon={<span className="text-lg">◎</span>}
              label="Total Invested"
              value={`${formatEth(summary.totalInvested)} ETH`}
              subtext="Across all watches"
            />
            <StatCard
              icon={<span className="text-lg">↗</span>}
              label="Current Value"
              value={`${formatEth(summary.currentValue)} ETH`}
              subtext="Estimated value"
              trend={
                summary.returnPct !== 0
                  ? `${summary.returnPct >= 0 ? "+" : ""}${summary.returnPct.toFixed(1)}%`
                  : undefined
              }
              trendPositive={summary.returnPct >= 0}
            />
            <StatCard
              icon={<span className="text-lg">$</span>}
              label="Total Earnings"
              value={`${formatEth(summary.totalEarnings)} ETH`}
              subtext="From sold watches"
            />
            <StatCard
              icon={<span className="text-lg">★</span>}
              label="Claimable Rewards"
              value={`${formatEth(summary.claimable)} ETH`}
              subtext="Ready to claim"
            />
          </div>

          {summary.claimable > 0n && (
            <div className="card p-5">
              <p className="font-medium text-zinc-100">Ready to claim rewards</p>
              <p className="mt-1 text-sm text-zinc-500">
                You have {formatEth(summary.claimable)} ETH available to claim
                from sold watches.
              </p>
              <button
                type="button"
                onClick={handleClaimAll}
                disabled={claiming || claimableHoldings.length === 0}
                className="btn-primary mt-4 w-full py-2.5 text-sm"
              >
                {claiming ? "Claiming..." : "Claim All"}
              </button>
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="font-semibold text-zinc-100">My Investments</h2>
          </div>

          {isLoading && (
            <p className="px-5 py-12 text-center text-zinc-500">Loading...</p>
          )}

          {!isLoading && (!holdings || holdings.length === 0) && (
            <div className="px-5 py-12 text-center">
              <p className="text-zinc-400">No investments yet.</p>
              <Link
                href="/"
                className="mt-3 inline-block text-sm text-orange-400 hover:underline"
              >
                Browse watches →
              </Link>
            </div>
          )}

          {holdings && holdings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Watch</th>
                    <th className="px-4 py-3 font-medium">Shares Owned</th>
                    <th className="px-4 py-3 font-medium">Avg. Price</th>
                    <th className="px-4 py-3 font-medium">Current Value</th>
                    <th className="px-4 py-3 font-medium">Earnings</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <PortfolioTableRow
                      key={h.watch.id.toString()}
                      holding={h}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-start gap-2 border-t border-zinc-800 px-5 py-3 text-xs text-zinc-600">
            <span>ⓘ</span>
            <span>
              Earnings are distributed proportionally when a watch is sold by
              the platform.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
