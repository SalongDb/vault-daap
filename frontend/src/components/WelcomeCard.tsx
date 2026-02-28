import Logo from "../assets/ethereum-eth-logo.svg";

export default function App() {
  return (
    <div className="h-screen bg-neutral-950 text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center px-8 md:px-16">

        {/* Hero */}
        <div className="max-w-6xl flex flex-col md:flex-row items-center gap-16">

          {/* Left Text */}
          <div className="flex-1">
            <h1 className="text-[8vw] leading-[0.95] font-semibold tracking-tight">
              Lock.
              <br />
              Wait.
              <br />
              Withdraw.
            </h1>

            <p className="mt-10 text-lg text-neutral-400 max-w-xl leading-relaxed">
              A decentralized 7-day Ethereum time vault.
              No admin keys. No shortcuts. Just immutable code.
            </p>
          </div>

          {/* Right Logo */}
          <div className="flex-1 flex justify-center md:justify-end">
            <img src={Logo} alt="Ethereum Logo" className="h-40 md:h-80" />
          </div>

        </div>

        {/* Info Strip */}
        <div className="mt-16 flex flex-col md:flex-row gap-12 text-neutral-500 text-sm uppercase tracking-wider">
          <span>Immutable Contract</span>
          <span>7-Day Lock</span>
          <span>Fully On-Chain</span>
        </div>

      </main>
    </div>
  );
}