import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // React Query
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi"; // Wagmi context
import { config } from "../config/wagmi"; // Wagmi config

const queryClient = new QueryClient(); // Create query client

// Wrap app with Wagmi + React Query providers
export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}