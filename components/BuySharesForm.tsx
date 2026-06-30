"use client";

import { useState } from "react";
import { useConnection } from "wagmi";
import { formatEth } from "@/lib/eth";
import { useBuyShares, useSharePrice } from "@/hooks/useWatchVault";

type BuySharesFormProps = {
  watchId: bigint;
  sold: boolean;
};

export function BuySharesForm({ watchId, sold }: BuySharesFormProps) {
  const { isConnected } = useConnection();
  const { data: sharePrice } = useSharePrice(watchId);
  const { buyShares, isPending, isConfirming, isSuccess, error } =
    useBuyShares(watchId);
  const [amount, setAmount] = useState("50");

  const amountBn = BigInt(amount || "0");
  const totalCost =
    sharePrice !== undefined ? amountBn * (sharePrice as bigint) : 0n;

  const handleBuy = async () => {
    if (!sharePrice || amountBn <= 0n) return;
    await buyShares(amountBn, sharePrice as bigint);
  };

  if (sold) {
    return (
      <div className="card px-4 py-4 text-sm text-zinc-400">
        This watch has been sold. Shares are no longer available.
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="card px-4 py-4 text-sm text-zinc-400">
        Connect MetaMask to invest in this watch.
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Invest</h3>
      <label className="mb-2 block text-sm text-zinc-500">Shares</label>
      <input
        type="number"
        min="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input-field mb-4"
      />
      {sharePrice !== undefined && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3">
          <span className="text-sm text-zinc-500">Total cost</span>
          <span className="font-semibold text-orange-400">
            {formatEth(totalCost)} ETH
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={handleBuy}
        disabled={isPending || isConfirming || amountBn <= 0n}
        className="btn-primary w-full py-3 text-sm"
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
