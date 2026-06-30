"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatEth, parseEth } from "@/lib/eth";
import {
  useAllWatches,
  useSellWatch,
  useWithdrawPlatformRevenue,
} from "@/hooks/useWatchVault";
import { RegisterWatchForm } from "@/components/AdminForms";

function DonutChart({
  activeValue,
  soldValue,
}: {
  activeValue: bigint;
  soldValue: bigint;
}) {
  const total = activeValue + soldValue;
  const activePct = total > 0n ? Number((activeValue * 100n) / total) : 100;
  const soldPct = 100 - activePct;

  return (
    <div className="relative mx-auto h-40 w-40">
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(
            #f97316 0% ${activePct}%,
            #525252 ${activePct}% ${activePct + soldPct}%,
            transparent ${activePct + soldPct}% 100%
          )`,
        }}
      />
      <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-[#141414] text-center">
        <p className="text-lg font-bold text-zinc-100">
          {formatEth(total)} ETH
        </p>
        <p className="text-xs text-zinc-500">Total Value</p>
      </div>
    </div>
  );
}

function AdminWatchRow({ watchId }: { watchId: bigint }) {
  const { data: watches } = useAllWatches();
  const watch = watches?.find((w) => w.id === watchId);
  const { sellWatch, isPending, isConfirming } = useSellWatch(watchId);
  const { withdraw, isPending: withdrawing } =
    useWithdrawPlatformRevenue(watchId);
  const [showSell, setShowSell] = useState(false);
  const [salePrice, setSalePrice] = useState("12");

  if (!watch) return null;

  const soldPct =
    watch.totalShares > 0n
      ? Number((watch.sharesSold * 100n) / watch.totalShares)
      : 0;
  const unsoldShares = watch.totalShares - watch.sharesSold;

  return (
    <>
      <tr className="border-b border-zinc-800/60">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-lg bg-zinc-800">
              {watch.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watch.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-zinc-100">
                {watch.brand} {watch.model}
              </p>
              <p className="text-xs text-zinc-500">{watch.year.toString()}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 text-sm font-medium text-zinc-100">
          {formatEth(watch.purchasePrice)} ETH
        </td>
        <td className="px-4 py-4">
          <div className="min-w-[120px]">
            <p className="mb-1 text-xs text-zinc-400">{soldPct}%</p>
            <ProgressBar value={soldPct} />
          </div>
        </td>
        <td className="px-4 py-4">
          <StatusBadge status={watch.sold ? "Sold" : "Active"} />
        </td>
        <td className="px-4 py-4">
          <div className="flex gap-2">
            <Link
              href={`/watch/${watch.id.toString()}`}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              View
            </Link>
            {!watch.sold ? (
              <button
                type="button"
                onClick={() => setShowSell(true)}
                className="btn-primary px-3 py-1.5 text-xs"
              >
                Sell
              </button>
            ) : (
              <Link
                href={`/watch/${watch.id.toString()}`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                History
              </Link>
            )}
          </div>
        </td>
      </tr>
      {showSell && (
        <tr>
          <td colSpan={5} className="bg-zinc-900/50 px-4 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <label>
                <span className="mb-1 block text-xs text-zinc-500">
                  Sale Price (ETH)
                </span>
                <input
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="input-field w-40 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  await sellWatch(parseEth(salePrice));
                  setShowSell(false);
                }}
                disabled={isPending || isConfirming}
                className="btn-primary px-4 py-2 text-sm"
              >
                {isPending || isConfirming ? "Processing..." : "Confirm Sale"}
              </button>
              <button
                type="button"
                onClick={() => setShowSell(false)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancel
              </button>
              {watch.sold && unsoldShares > 0n && (
                <button
                  type="button"
                  onClick={() => withdraw()}
                  disabled={withdrawing}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Withdraw Platform Share
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function AdminDashboard() {
  const { data: watches, isLoading } = useAllWatches();
  const [showRegister, setShowRegister] = useState(false);

  const stats = useMemo(() => {
    if (!watches?.length) {
      return {
        count: 0,
        tvl: 0n,
        sharesSold: 0n,
        totalShares: 0n,
        distributed: 0n,
        activeValue: 0n,
        soldValue: 0n,
      };
    }
    const active = watches.filter((w) => !w.sold);
    const sold = watches.filter((w) => w.sold);
    return {
      count: watches.length,
      tvl: active.reduce((s, w) => s + w.purchasePrice, 0n),
      sharesSold: watches.reduce((s, w) => s + w.sharesSold, 0n),
      totalShares: watches.reduce((s, w) => s + w.totalShares, 0n),
      distributed: sold.reduce((s, w) => s + w.salePrice, 0n),
      activeValue: active.reduce((s, w) => s + w.purchasePrice, 0n),
      soldValue: sold.reduce((s, w) => s + w.salePrice, 0n),
    };
  }, [watches]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-zinc-500">
            Manage and tokenize luxury watches on Ethereum Sepolia.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          className="btn-primary shrink-0 px-5 py-2.5 text-sm"
        >
          + Register New Watch
        </button>
      </div>

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">
                Register New Watch
              </h2>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
            <RegisterWatchForm onSuccess={() => setShowRegister(false)} />
          </div>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<span>⌚</span>}
          label="Total Watches"
          value={stats.count.toString()}
          subtext="Active listings"
        />
        <StatCard
          icon={<span>◎</span>}
          label="Total Value Locked"
          value={`${formatEth(stats.tvl)} ETH`}
          subtext="Across all watches"
        />
        <StatCard
          icon={<span>👥</span>}
          label="Shares Sold"
          value={
            stats.totalShares > 0n
              ? `${Number((stats.sharesSold * 100n) / stats.totalShares)}%`
              : "0%"
          }
          subtext={`${stats.sharesSold.toString()} of ${stats.totalShares.toString()} shares`}
        />
        <StatCard
          icon={<span>$</span>}
          label="Total Distributed"
          value={`${formatEth(stats.distributed)} ETH`}
          subtext="From sold watches"
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_300px]">
        <div className="card overflow-hidden">
          <div className="border-b border-zinc-800 px-5 py-4">
            <h2 className="font-semibold text-zinc-100">Listed Watches</h2>
          </div>

          {isLoading && (
            <p className="px-5 py-12 text-center text-zinc-500">Loading...</p>
          )}

          {!isLoading && (!watches || watches.length === 0) && (
            <p className="px-5 py-12 text-center text-zinc-500">
              No watches registered yet.
            </p>
          )}

          {watches && watches.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Watch</th>
                    <th className="px-4 py-3 font-medium">Total Value</th>
                    <th className="px-4 py-3 font-medium">Shares Sold</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watches.map((w) => (
                    <AdminWatchRow key={w.id.toString()} watchId={w.id} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-zinc-100">Overview</h3>
            <DonutChart
              activeValue={stats.activeValue}
              soldValue={stats.soldValue}
            />
            <div className="mt-4 flex justify-center gap-6 text-xs">
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Active
              </span>
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                Sold
              </span>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-zinc-100">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Register Watch", action: () => setShowRegister(true) },
                { label: "Manage Watches", href: "#listed" },
                { label: "View Investors", href: "/portfolio" },
                { label: "Sales History", href: "/?filter=sold" },
              ].map((item) =>
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
                  >
                    <span className="text-lg text-orange-500">◆</span>
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
                  >
                    <span className="text-lg text-orange-500">◆</span>
                    {item.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
