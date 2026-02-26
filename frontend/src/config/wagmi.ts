import { localhost, sepolia } from "viem/chains";
import { createConfig, http, injected } from "wagmi";


export const config = createConfig({
    chains: [localhost,sepolia],
    connectors: [injected()],
    transports: {
        [localhost.id]: http(),
        [sepolia.id]: http(),
    },
});