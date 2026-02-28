// Props from parent (wallet state + actions)
interface NavbarProps {
  isConnected: boolean;   // Wallet connection status
  address?: string;       // Connected wallet address
  onConnect: () => void;  // Connect wallet
  onDisconnect: () => void; // Disconnect wallet
}

export default function Navbar({
  isConnected,
  address,
  onConnect,
  onDisconnect,
}: NavbarProps) {
  return (
    <nav className="relative w-full px-8 md:px-16 py-8 flex items-center justify-between bg-neutral-950">

      {/* Brand name */}
      <div className="text-sm tracking-[0.35em] uppercase text-neutral-400">
        ETHVAULT
      </div>

      {/* Show shortened address if connected */}
      {isConnected && (
        <div className="absolute left-1/2 -translate-x-1/2 text-sm text-neutral-500 tracking-wider">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      )}

      {/* Connect / Disconnect button */}
      <div>
        {!isConnected ? (
          <button
            onClick={onConnect} // Connect wallet
            className="text-sm uppercase tracking-widest text-white border-b border-white/60 pb-1 hover:border-white hover:text-neutral-300 transition-all duration-300"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={onDisconnect} // Disconnect wallet
            className="text-sm uppercase tracking-widest text-white border-b border-white/60 pb-1 hover:border-white hover:text-neutral-300 transition-all duration-300"
          >
            Disconnect
          </button>
        )}
      </div>

    </nav>
  );
}