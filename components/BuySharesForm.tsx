"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatEth } from "@/lib/eth";
import { useBuyShares, useSharePrice } from "@/hooks/useWatchVault";

type BuySharesFormProps = {
  watchId: bigint;
  sold: boolean;
};

export function BuySharesForm({ watchId, sold }: BuySharesFormProps) {
  const { isConnected } = useAccount();
  const { data: sharePrice } = useSharePrice(watchId);
  const { buyShares, isPending, isConfirming, isSuccess, error } =
    useBuyShares(watchId);
  const [amount, setAmount] = useState("10");

  const amountBn = BigInt(amount || "0");
  const totalCost =
    sharePrice !== undefined ? amountBn * (sharePrice as bigint) : 0n;

  const handleBuy = async () => {
    if (!sharePrice || amountBn <= 0n) return;
    await buyShares(amountBn, sharePrice as bigint);
  };

  if (sold) {
    return (
      <p className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
        This watch has been sold. Shares are no longer available.
      </p>
    );
  }

  if (!isConnected) {
    return (
      <p className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-400">
        Connect MetaMask to invest.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-medium text-zinc-100">Invest</h3>
      <label className="mb-2 block text-sm text-zinc-400">Shares</label>
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 outline-none focus:border-amber-600"
      />
      {sharePrice !== undefined && (
        <p className="mb-4 text-sm text-zinc-400">
          Total cost:{" "}
          <span className="font-medium text-amber-500">
            {formatEth(totalCost)} ETH
          </span>
        </p>
      )}
      <button
        type="button"
        onClick={handleBuy}
        disabled={isPending || isConfirming || amountBn <= 0n}
        className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
      >
        {isPending || isConfirming ? "Processing..." : "Buy Shares"}
      </button>
      {isSuccess && (
        <p className="mt-3 text-sm text-emerald-400">Purchase successful!</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error.message.slice(0, 120)}
        </p>
      )}
    </div>
  );
}
