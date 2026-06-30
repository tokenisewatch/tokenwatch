"use client";

import { useState } from "react";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { decodeEventLog } from "viem";
import { parseEth, formatEth } from "@/lib/eth";
import { metadataUriForWatch } from "@/lib/watch-metadata";
import {
  WATCH_VAULT_ABI,
  WATCH_VAULT_ADDRESS,
} from "@/lib/contract";
import { wagmiConfig } from "@/lib/wagmi";
import {
  useRegisterWatch,
  useAllWatches,
  useSellWatch,
  useWithdrawPlatformRevenue,
} from "@/hooks/useWatchVault";
import { ImageDropzone } from "@/components/ImageDropzone";

export function RegisterWatchForm({ onSuccess }: { onSuccess?: () => void }) {
  const { registerWatch, isPending, isConfirming, error } = useRegisterWatch();
  const [brand, setBrand] = useState("Rolex");
  const [model, setModel] = useState("Daytona");
  const [year, setYear] = useState("2022");
  const [description, setDescription] = useState("Luxury chronograph watch");
  const [purchasePrice, setPurchasePrice] = useState("10");
  const [totalShares, setTotalShares] = useState("1000");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const busy = uploading || isPending || isConfirming;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!imageFile) {
      setFormError("Please drag and drop a watch image.");
      return;
    }

    try {
      setUploading(true);
      setStatus("Uploading image...");

      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      const uploadRes = await fetch("/api/watches/upload", {
        method: "POST",
        body: uploadData,
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error ?? "Image upload failed");
      }
      const { imagePath } = (await uploadRes.json()) as { imagePath: string };

      setUploading(false);
      setStatus("Preparing on-chain registration...");

      const nextWatchId = (await readContract(wagmiConfig, {
        address: WATCH_VAULT_ADDRESS,
        abi: WATCH_VAULT_ABI,
        functionName: "getWatchCount",
      })) as bigint;

      const metadataUri = metadataUriForWatch(nextWatchId);

      setStatus("Minting watch NFT on Sepolia...");

      const hash = await registerWatch({
        brand,
        model,
        year: BigInt(year),
        description,
        imageUrl: imagePath,
        metadataUri,
        purchasePrice: parseEth(purchasePrice),
        totalShares: BigInt(totalShares),
      });

      setStatus("Waiting for confirmation...");

      let watchId = Number(nextWatchId);

      try {
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash,
          pollingInterval: 2_000,
          timeout: 180_000,
        });

        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: WATCH_VAULT_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "WatchRegistered") {
              const args = decoded.args as unknown as { watchId: bigint };
              watchId = Number(args.watchId);
              break;
            }
          } catch {
            // not our event
          }
        }
      } catch {
        // RPC receipt polling can fail even when MetaMask broadcast succeeded
        const currentCount = (await readContract(wagmiConfig, {
          address: WATCH_VAULT_ADDRESS,
          abi: WATCH_VAULT_ABI,
          functionName: "getWatchCount",
        })) as bigint;

        if (currentCount > nextWatchId) {
          watchId = Number(nextWatchId);
        } else {
          throw new Error(
            `Transaction submitted (${hash.slice(0, 10)}…) but confirmation timed out. Check Sepolia Etherscan, then retry metadata save if needed.`
          );
        }
      }

      setStatus("Saving watch metadata locally...");

      await fetch("/api/watches/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchId,
          brand,
          model,
          year: Number(year),
          description,
          image: imagePath,
          purchasePriceEth: purchasePrice,
          totalShares: Number(totalShares),
          tokenURI: metadataUri,
          txHash: hash,
          nftTokenId: watchId,
          registeredAt: new Date().toISOString(),
        }),
      });

      setStatus("Watch registered and NFT minted!");
      onSuccess?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Brand</span>
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="input-field"
            required
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Model</span>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="input-field"
            required
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Year</span>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input-field"
            required
            disabled={busy}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">
            Purchase Price (ETH)
          </span>
          <input
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="input-field"
            required
            disabled={busy}
          />
        </label>

        <ImageDropzone
          file={imageFile}
          preview={imagePreview}
          disabled={busy}
          onFileSelect={(file, preview) => {
            setImageFile(file);
            setImagePreview(preview);
            setFormError(null);
          }}
          onClear={() => {
            setImageFile(null);
            setImagePreview(null);
          }}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-zinc-400">Total Shares</span>
          <input
            value={totalShares}
            onChange={(e) => setTotalShares(e.target.value)}
            className="input-field"
            required
            disabled={busy}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-zinc-400">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
            required
            disabled={busy}
          />
        </label>
      </div>

      <p className="text-xs text-zinc-500">
        Registers the watch on Sepolia, mints an ERC-721 NFT to the platform
        wallet, and saves metadata under{" "}
        <code className="text-zinc-400">data/watches/</code>.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="btn-primary px-6 py-2.5 text-sm"
      >
        {busy ? "Registering..." : "Register & Mint NFT"}
      </button>

      {status && <p className="text-sm text-orange-300">{status}</p>}
      {formError && <p className="text-sm text-red-400">{formError}</p>}
      {error && (
        <p className="text-sm text-red-400">{error.message.slice(0, 120)}</p>
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
