"use client";

import { useState } from "react";
import { parseEth, formatEth } from "@/lib/eth";
import {
  useAllWatches,
  useRegisterWatch,
  useSellWatch,
  useWithdrawPlatformRevenue,
} from "@/hooks/useWatchVault";

export function RegisterWatchForm() {
  const { registerWatch, isPending, isConfirming, isSuccess, error } =
    useRegisterWatch();
  const [brand, setBrand] = useState("Rolex");
  const [model, setModel] = useState("Daytona");
  const [year, setYear] = useState("2022");
  const [description, setDescription] = useState("Luxury chronograph watch");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1523170335258-f5ed11844cfe?w=800"
  );
  const [purchasePrice, setPurchasePrice] = useState("10");
  const [totalShares, setTotalShares] = useState("1000");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerWatch({
      brand,
      model,
      year: BigInt(year),
      description,
      imageUrl,
      purchasePrice: parseEth(purchasePrice),
      totalShares: BigInt(totalShares),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <h3 className="mb-4 text-lg font-medium text-zinc-100">Register Watch</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Brand</span>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Model</span>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Year</span>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Purchase Price (ETH)</span>
          <input
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-zinc-400">Image URL</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Total Shares</span>
          <input
            value={totalShares}
            onChange={(e) => setTotalShares(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-zinc-400">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            required
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="mt-4 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
      >
        {isPending || isConfirming ? "Registering..." : "Register"}
      </button>
      {isSuccess && (
        <p className="mt-3 text-sm text-emerald-400">Watch registered!</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-400">{error.message.slice(0, 120)}</p>
      )}
    </form>
  );
}

function SellWatchPanel({ watchId }: { watchId: bigint }) {
  const { data: watches } = useAllWatches();
  const watch = watches?.find((w) => w.id === watchId);
  const { sellWatch, isPending, isConfirming, isSuccess, error } =
    useSellWatch(watchId);
  const {
    withdraw,
    isPending: withdrawing,
    isConfirming: confirmingWithdraw,
    isSuccess: withdrawSuccess,
  } = useWithdrawPlatformRevenue(watchId);
  const [salePrice, setSalePrice] = useState("12");

  if (!watch) return null;

  const unsoldShares = watch.totalShares - watch.sharesSold;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="font-medium text-zinc-200">
        #{watch.id.toString()} — {watch.brand} {watch.model}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Sold: {watch.sharesSold.toString()} / {watch.totalShares.toString()} shares
      </p>
      {!watch.sold ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label>
            <span className="mb-1 block text-xs text-zinc-500">Sale Price (ETH)</span>
            <input
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-amber-600"
            />
          </label>
          <button
            type="button"
            onClick={() => sellWatch(parseEth(salePrice))}
            disabled={isPending || isConfirming}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {isPending || isConfirming ? "Selling..." : "Sell Watch"}
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-zinc-400">
          Sold for {formatEth(watch.salePrice)} ETH
        </p>
      )}
      {watch.sold && unsoldShares > 0n && (
        <button
          type="button"
          onClick={() => withdraw()}
          disabled={withdrawing || confirmingWithdraw}
          className="mt-3 rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          Withdraw Platform Share ({unsoldShares.toString()} unsold)
        </button>
      )}
      {isSuccess && (
        <p className="mt-2 text-sm text-emerald-400">Sale recorded on-chain!</p>
      )}
      {withdrawSuccess && (
        <p className="mt-2 text-sm text-emerald-400">Platform revenue withdrawn!</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error.message.slice(0, 100)}</p>
      )}
    </div>
  );
}

export function SellWatchForm() {
  const { data: watches, isLoading } = useAllWatches();

  if (isLoading) {
    return <p className="text-zinc-500">Loading watches...</p>;
  }

  if (!watches?.length) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-500">
        No watches registered yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-medium text-zinc-100">Sell Watch</h3>
      <div className="flex flex-col gap-4">
        {watches.map((watch) => (
          <SellWatchPanel key={watch.id.toString()} watchId={watch.id} />
        ))}
      </div>
    </div>
  );
}

export function WatchesTable() {
  const { data: watches, isLoading } = useAllWatches();

  if (isLoading) {
    return <p className="text-zinc-500">Loading...</p>;
  }

  if (!watches?.length) {
    return <p className="text-zinc-500">No watches yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900 text-zinc-400">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Watch</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Shares Sold</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {watches.map((watch) => (
            <tr key={watch.id.toString()} className="border-b border-zinc-800/50">
              <td className="px-4 py-3 text-zinc-300">{watch.id.toString()}</td>
              <td className="px-4 py-3 text-zinc-100">
                {watch.brand} {watch.model}
              </td>
              <td className="px-4 py-3 text-amber-500">
                {formatEth(watch.purchasePrice)} ETH
              </td>
              <td className="px-4 py-3 text-zinc-400">
                {watch.sharesSold.toString()} / {watch.totalShares.toString()}
              </td>
              <td className="px-4 py-3">
                {watch.sold ? (
                  <span className="text-zinc-400">Sold</span>
                ) : (
                  <span className="text-emerald-400">Active</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
