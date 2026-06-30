"use client";

import Link from "next/link";
import { BuySharesForm } from "@/components/BuySharesForm";
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
    return <p className="text-zinc-500">Loading watch...</p>;
  }

  if (error || !watch) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="text-zinc-400">Watch not found.</p>
        <Link href="/" className="mt-4 inline-block text-amber-500 hover:underline">
          Back to watches
        </Link>
      </div>
    );
  }

  const status = watchStatus(watch);
  const remainingShares = (remaining as bigint | undefined) ?? 0n;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {watch.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={watch.imageUrl}
              alt={`${watch.brand} ${watch.model}`}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-zinc-800 text-zinc-600">
              No image
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              status === "Active"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-zinc-700 text-zinc-300"
            }`}
          >
            {status}
          </span>
          <span className="text-sm text-zinc-500">{watch.year.toString()}</span>
        </div>
        <h1 className="text-3xl font-semibold text-zinc-100">
          {watch.brand} {watch.model}
        </h1>
        <p className="mt-4 text-zinc-400">{watch.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div>
            <dt className="text-xs text-zinc-500">Purchase Price</dt>
            <dd className="text-lg font-medium text-amber-500">
              {formatEth(watch.purchasePrice)} ETH
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Total Shares</dt>
            <dd className="text-lg text-zinc-200">
              {watch.totalShares.toString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Remaining Shares</dt>
            <dd className="text-lg text-zinc-200">{remainingShares.toString()}</dd>
          </div>
          {watch.sold && (
            <div>
              <dt className="text-xs text-zinc-500">Sale Price</dt>
              <dd className="text-lg text-zinc-200">
                {formatEth(watch.salePrice)} ETH
              </dd>
            </div>
          )}
        </dl>

        {isOwner && (
          <p className="mt-4 text-sm text-zinc-500">
            Admin view —{" "}
            <Link href="/admin" className="text-amber-500 hover:underline">
              manage watches
            </Link>
          </p>
        )}

        <div className="mt-6">
          <BuySharesForm watchId={watchId} sold={watch.sold} />
        </div>
      </div>
    </div>
  );
}
