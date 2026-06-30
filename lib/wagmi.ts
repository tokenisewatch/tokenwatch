import { createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { sepolia, sepoliaTransport } from "@/lib/rpc";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask({
      dapp: {
        name: "TokenWatch",
        url: appUrl,
      },
    }),
    injected({ target: "metaMask" }),
  ],
  transports: {
    [sepolia.id]: sepoliaTransport(),
  },
  ssr: false,
});
