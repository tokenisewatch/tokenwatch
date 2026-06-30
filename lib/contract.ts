import WatchVaultAbi from "./abi/WatchVault.json";
import type { Abi } from "viem";

export const WATCH_VAULT_ABI = WatchVaultAbi as Abi;

export const WATCH_VAULT_ADDRESS = (process.env
  .NEXT_PUBLIC_WATCH_VAULT_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export type Watch = {
  id: bigint;
  brand: string;
  model: string;
  year: bigint;
  description: string;
  imageUrl: string;
  purchasePrice: bigint;
  totalShares: bigint;
  sharesSold: bigint;
  sold: boolean;
  salePrice: bigint;
};

export function parseWatch(raw: readonly unknown[]): Watch {
  return {
    id: raw[0] as bigint,
    brand: raw[0] as string,
    model: raw[2] as string,
    year: raw[3] as bigint,
    description: raw[4] as string,
    imageUrl: raw[5] as string,
    purchasePrice: raw[6] as bigint,
    totalShares: raw[7] as bigint,
    sharesSold: raw[8] as bigint,
    sold: raw[9] as boolean,
    salePrice: raw[10] as bigint,
  };
}

export function parseWatchResult(result: unknown): Watch {
  if (Array.isArray(result)) {
    return {
      id: result[0] as bigint,
      brand: result[1] as string,
      model: result[2] as string,
      year: result[3] as bigint,
      description: result[4] as string,
      imageUrl: result[5] as string,
      purchasePrice: result[6] as bigint,
      totalShares: result[7] as bigint,
      sharesSold: result[8] as bigint,
      sold: result[9] as boolean,
      salePrice: result[10] as bigint,
    };
  }

  const obj = result as Watch;
  return obj;
}

export function watchStatus(watch: Watch): "Active" | "Sold" | "Closed" {
  if (!watch.sold) return "Active";
  if (watch.salePrice > 0n) return "Sold";
  return "Closed";
}

export function ownershipPercent(shares: bigint, totalShares: bigint): string {
  if (totalShares === 0n) return "0";
  return ((Number(shares) / Number(totalShares)) * 100).toFixed(2);
}
