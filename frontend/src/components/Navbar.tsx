interface NavbarProps {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Navbar({
  isConnected,
  address,
  onConnect,
  onDisconnect,
}: NavbarProps) {
  return (
    <nav className="relative w-full px-8 md:px-16 py-8 flex items-center justify-between bg-neutral-950">

      {/* LEFT — Brand */}
      <div className="text-sm tracking-[0.35em] uppercase text-neutral-400">
        ETHVAULT
      </div>

      {/* CENTER — Address */}
      {isConnected && (
        <div className="absolute left-1/2 -translate-x-1/2 text-sm text-neutral-500 tracking-wider">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
      )}

      {/* RIGHT — Connect / Disconnect */}
      <div>
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="text-sm uppercase tracking-widest text-white border-b border-white/60 pb-1 hover:border-white hover:text-neutral-300 transition-all duration-300"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={onDisconnect}
            className="text-sm uppercase tracking-widest text-white border-b border-white/60 pb-1 hover:border-white hover:text-neutral-300 transition-all duration-300"
          >
            Disconnect
          </button>
        )}
      </div>

    </nav>
  );
}