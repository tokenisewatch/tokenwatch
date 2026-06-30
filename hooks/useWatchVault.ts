"use client";

import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useConnection,
} from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { readContract } from "wagmi/actions";
import {
  WATCH_VAULT_ABI,
  WATCH_VAULT_ADDRESS,
  parseWatchResult,
  type Watch,
} from "@/lib/contract";
import { parseEth } from "@/lib/eth";
import { wagmiConfig } from "@/lib/wagmi";

export const WATCHES_QUERY_KEY = ["watches"];

async function fetchAllWatches(): Promise<Watch[]> {
  if (
    !WATCH_VAULT_ADDRESS ||
    WATCH_VAULT_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    return [];
  }

  const count = (await readContract(wagmiConfig, {
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "getWatchCount",
  })) as bigint;

  const watches: Watch[] = [];
  for (let i = 0n; i < count; i++) {
    const raw = await readContract(wagmiConfig, {
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "getWatch",
      args: [i],
    });
    watches.push(parseWatchResult(raw));
  }
  return watches;
}

export function useWatchVaultEvents() {
  const queryClient = useQueryClient();
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: WATCHES_QUERY_KEY });
  }, [queryClient]);

  useWatchContractEvent({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    eventName: "WatchRegistered",
    onLogs: invalidate,
  });
  useWatchContractEvent({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    eventName: "SharesPurchased",
    onLogs: invalidate,
  });
  useWatchContractEvent({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    eventName: "WatchSold",
    onLogs: invalidate,
  });
  useWatchContractEvent({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    eventName: "RevenueClaimed",
    onLogs: invalidate,
  });
}

export function useAllWatches() {
  useWatchVaultEvents();
  return useQuery({
    queryKey: WATCHES_QUERY_KEY,
    queryFn: fetchAllWatches,
    refetchInterval: 30_000,
  });
}

export function useWatch(watchId: bigint) {
  return useReadContract({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "getWatch",
    args: [watchId],
    query: {
      enabled: watchId >= 0n,
      select: (data) => parseWatchResult(data),
    },
  });
}

export function useRemainingShares(watchId: bigint) {
  return useReadContract({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "remainingShares",
    args: [watchId],
  });
}

export function useSharePrice(watchId: bigint) {
  return useReadContract({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "sharePrice",
    args: [watchId],
  });
}

export function useMyShares(watchId: bigint) {
  const { address } = useConnection();
  return useReadContract({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "shares",
    args: address ? [watchId, address] : undefined,
    query: { enabled: !!address },
  });
}

export function useClaimable(watchId: bigint) {
  const { address } = useConnection();
  return useReadContract({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "claimableAmount",
    args: address ? [watchId, address] : undefined,
    query: { enabled: !!address },
  });
}

export function useContractOwner() {
  return useReadContract({
    address: WATCH_VAULT_ADDRESS,
    abi: WATCH_VAULT_ABI,
    functionName: "owner",
  });
}

export function useIsOwner() {
  const { address } = useConnection();
  const { data: owner } = useContractOwner();
  return address && owner
    ? address.toLowerCase() === (owner as string).toLowerCase()
    : false;
}

export function useBuyShares(watchId: bigint) {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buyShares = async (amount: bigint, sharePrice: bigint) => {
    const cost = amount * sharePrice;
    return writeContractAsync({
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "buyShares",
      args: [watchId, amount],
      value: cost,
    });
  };

  return { buyShares, isPending, isConfirming, isSuccess, error, hash };
}

export function useClaimRevenue(watchId: bigint) {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimRevenue = async () => {
    return writeContractAsync({
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "claimRevenue",
      args: [watchId],
    });
  };

  return { claimRevenue, isPending, isConfirming, isSuccess, error, hash };
}

export function useRegisterWatch() {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerWatch = async (params: {
    brand: string;
    model: string;
    year: bigint;
    description: string;
    imageUrl: string;
    metadataUri: string;
    purchasePrice: bigint;
    totalShares: bigint;
  }) => {
    return writeContractAsync({
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "registerWatch",
      args: [
        params.brand,
        params.model,
        params.year,
        params.description,
        params.imageUrl,
        params.metadataUri,
        params.purchasePrice,
        params.totalShares,
      ],
    });
  };

  return { registerWatch, isPending, isConfirming, isSuccess, error, hash };
}

export function useSellWatch(watchId: bigint) {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sellWatch = async (salePrice: bigint) => {
    return writeContractAsync({
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "sellWatch",
      args: [watchId],
      value: salePrice,
    });
  };

  return { sellWatch, isPending, isConfirming, isSuccess, error, hash };
}

export function useWithdrawPlatformRevenue(watchId: bigint) {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const withdraw = async () => {
    return writeContractAsync({
      address: WATCH_VAULT_ADDRESS,
      abi: WATCH_VAULT_ABI,
      functionName: "withdrawPlatformRevenue",
      args: [watchId],
    });
  };

  return { withdraw, isPending, isConfirming, isSuccess, error, hash };
}
