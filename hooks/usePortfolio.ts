"use client";

import { useConnection } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import {
  WATCH_VAULT_ABI,
  WATCH_VAULT_ADDRESS,
  ownershipPercent,
  type Watch,
} from "@/lib/contract";
import { formatEth } from "@/lib/eth";
import { wagmiConfig } from "@/lib/wagmi";
import { useAllWatches } from "@/hooks/useWatchVault";

export type Holding = {
  watch: Watch;
  shares: bigint;
  sharePrice: bigint;
  invested: bigint;
  claimable: bigint;
  currentValue: bigint;
  earnings: bigint;
};

async function fetchHoldings(
  address: `0x${string}`,
  watches: Watch[]
): Promise<Holding[]> {
  const holdings: Holding[] = [];

  for (const watch of watches) {
    const shares = (await readContract(wagmiConfig, {
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "shares",
      args: [watch.id, address],
    })) as bigint;

    if (shares === 0n) continue;

    const sharePrice =
      watch.totalShares > 0n ? watch.purchasePrice / watch.totalShares : 0n;
    const invested = shares * sharePrice;

    const claimable = (await readContract(wagmiConfig, {
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "claimableAmount",
      args: [watch.id, address],
    })) as bigint;

    let currentValue = invested;
    let earnings = 0n;

    if (watch.sold && watch.totalShares > 0n) {
      const payout = (watch.salePrice * shares) / watch.totalShares;
      currentValue = payout;
      earnings = payout > invested ? payout - invested : 0n;
    }

    holdings.push({
      watch,
      shares,
      sharePrice,
      invested,
      claimable,
      currentValue,
      earnings,
    });
  }

  return holdings;
}

export function usePortfolio() {
  const { address, isConnected } = useConnection();
  const { data: watches } = useAllWatches();

  return useQuery({
    queryKey: ["portfolio", address, watches?.length],
    queryFn: () => fetchHoldings(address!, watches!),
    enabled: isConnected && !!address && !!watches && watches.length > 0,
  });
}

export function computePortfolioSummary(holdings: Holding[]) {
  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0n);
  const currentValue = holdings.reduce((s, h) => s + h.currentValue, 0n);
  const totalEarnings = holdings.reduce((s, h) => s + h.earnings, 0n);
  const claimable = holdings.reduce((s, h) => s + h.claimable, 0n);

  const returnPct =
    totalInvested > 0n
      ? Number(((currentValue - totalInvested) * 10000n) / totalInvested) / 100
      : 0;

  return { totalInvested, currentValue, totalEarnings, claimable, returnPct };
}

export { ownershipPercent };
