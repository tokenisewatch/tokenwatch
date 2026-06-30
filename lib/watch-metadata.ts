export type WatchMetadata = {
  watchId: number;
  brand: string;
  model: string;
  year: number;
  description: string;
  image: string;
  purchasePriceEth: string;
  totalShares: number;
  tokenURI: string;
  txHash?: string;
  nftTokenId: number;
  registeredAt: string;
};

export function metadataUriForWatch(watchId: number | bigint): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  return `${base}/api/watches/metadata/${watchId.toString()}`;
}
