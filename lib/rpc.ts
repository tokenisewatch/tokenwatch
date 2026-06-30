import { http, type HttpTransport } from "viem";
import { sepolia } from "wagmi/chains";

/** Reliable public fallback if no env RPC is configured. */
const PUBLIC_SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export function getSepoliaRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL?.trim() ||
    process.env.SEPOLIA_RPC_URL?.trim() ||
    PUBLIC_SEPOLIA_RPC
  );
}

export function sepoliaTransport(): HttpTransport {
  return http(getSepoliaRpcUrl(), {
    batch: false,
    retryCount: 3,
    retryDelay: 1_000,
    timeout: 30_000,
  });
}

export { sepolia };
