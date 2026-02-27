import { sepolia } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

export const config = createConfig({
    chains: [sepolia],
    connectors: [injected()],
    transports: {
        [sepolia.id]: http(),
    },
});