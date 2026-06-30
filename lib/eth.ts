import { formatEther, parseEther } from "viem";

export function formatEth(value: bigint): string {
  const formatted = formatEther(value);
  const num = Number(formatted);
  if (num === 0) return "0";
  if (num < 0.0001) return num.toExponential(2);
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function parseEth(value: string): bigint {
  return parseEther(value || "0");
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
