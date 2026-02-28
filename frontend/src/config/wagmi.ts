import { sepolia } from "viem/chains"; // Sepolia testnet
import { createConfig, http, injected } from "wagmi"; 

// Wagmi config for wallet + network
export const config = createConfig({
    chains: [sepolia],        // Use Sepolia network
    connectors: [injected()], // MetaMask / injected wallets
    transports: {
        [sepolia.id]: http(), // RPC connection
    },
});