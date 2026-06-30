"use client";

import Link from "next/link";
import { BuySharesForm } from "@/components/BuySharesForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatEth } from "@/lib/eth";
import { watchStatus } from "@/lib/contract";
import {
  useIsOwner,
  useRemainingShares,
  useWatch,
} from "@/hooks/useWatchVault";
import { use } from "react";

export default function WatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const watchId = BigInt(id);
  const { data: watch, isLoading, error } = useWatch(watchId);
  const { data: remaining } = useRemainingShares(watchId);
  const isOwner = useIsOwner();

  if (isLoading) {
    return <p className="py-12 text-center text-zinc-500">Loading watch...</p>;
  }

  if (error || !watch) {
    return (
      <div className="card p-12 text-center">
        <p className="text-zinc-400">Watch not found.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-orange-400 hover:underline"
        >
          ← Back to watches
        </Link>
      </div>
    );
  }

  const status = watchStatus(watch);
  const remainingShares = (remaining as bigint | undefined) ?? 0n;
  const sharePrice =
    watch.totalShares > 0n ? watch.purchasePrice / watch.totalShares : 0n;
  const soldPct =
    watch.totalShares > 0n
      ? Number((watch.sharesSold * 100n) / watch.totalShares)
      : 0;

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Back to watches
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden">
          {watch.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={watch.imageUrl}
              alt={`${watch.brand} ${watch.model}`}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-zinc-900 text-zinc-600">
              No image
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <StatusBadge status={status} />
            <span className="text-sm text-zinc-500">{watch.year.toString()}</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">
            {watch.brand} {watch.model}
          </h1>
          <p className="mt-4 leading-relaxed text-zinc-400">{watch.description}</p>

          <div className="card mt-6 grid grid-cols-2 gap-4 p-5">
            <div>
              <p className="text-xs text-zinc-500">Total Value</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">
                {formatEth(watch.purchasePrice)} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Price per Share</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">
                {formatEth(sharePrice)} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Shares</p>
              <p className="mt-1 text-lg text-zinc-200">
                {watch.totalShares.toString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Remaining</p>
              <p className="mt-1 text-lg text-zinc-200">
                {remainingShares.toString()}
              </p>
            </div>
            {watch.sold && (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500">Final Sale Price</p>
                <p className="mt-1 text-lg font-semibold text-emerald-400">
                  {formatEth(watch.salePrice)} ETH
                </p>
              </div>
            )}
          </div>

          {!watch.sold && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Shares Sold</span>
                <span>
                  {watch.sharesSold.toString()} / {watch.totalShares.toString()}{" "}
                  ({soldPct}%)
                </span>
              </div>
              <ProgressBar value={soldPct} className="mt-2" />
            </div>
          )}

          {isOwner && (
            <p className="mt-4 text-sm text-zinc-500">
              Admin —{" "}
              <Link href="/admin" className="text-orange-400 hover:underline">
                manage watches
              </Link>
            </p>
          )}

          <div className="mt-6">
            <BuySharesForm watchId={watchId} sold={watch.sold} />
          </div>
        </div>
      </div>
    </div>
  );
}
