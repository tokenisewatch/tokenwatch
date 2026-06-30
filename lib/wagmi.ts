import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

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
    [sepolia.id]: http(),
  },
  ssr: false,
});
