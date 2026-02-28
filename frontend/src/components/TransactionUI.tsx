import { useEffect, useState } from "react";

// Props coming from parent (contract data + actions)
interface Props {
  balance: string;                 // Current vault balance
  depositTimestamp: number;        // When user deposited (in seconds)
  lockPeriod: number;              // Lock duration (in seconds)
  deposit: (amount: string) => void;
  withdraw: (amount: string) => void;
}

export default function TransactionUI({
  balance,
  depositTimestamp,
  lockPeriod,
  deposit,
  withdraw,
}: Props) {

  const [amount, setAmount] = useState("");   // User input amount
  const [timeLeft, setTimeLeft] = useState(0); // Remaining lock time

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!depositTimestamp) return; // No deposit → no timer

      const unlockTime = depositTimestamp + lockPeriod;
      const now = Math.floor(Date.now() / 1000);
      const remaining = unlockTime - now;

      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval); // Cleanup
  }, [depositTimestamp, lockPeriod]);

  // Convert seconds → days, hours, minutes, seconds
  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  // Withdraw allowed only after timer ends
  const canWithdraw = timeLeft === 0 && depositTimestamp !== 0;

  return (
    <div className="flex justify-center items-center mt-20 px-6 text-white">
      <div className="w-full max-w-3xl bg-[#2c2f36] border border-white/10 rounded-3xl p-10">

        {/* Vault Balance */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Vault Balance
          </p>
          <h2 className="text-5xl font-semibold mt-4 tracking-tight">
            {balance} ETH
          </h2>
        </div>

        {/* Countdown (only if deposited) */}
        {depositTimestamp !== 0 && (
          <div className="mb-5 flex items-end gap-5 text-sm text-white/50">
            <span className="text-lg text-white/80">Lock Progress</span>
            <span>{formatTime(timeLeft)} left</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">

          {/* Deposit */}
          <div className="bg-[#1f2228] p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-medium mb-5 tracking-wide">
              Deposit ETH
            </h3>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 mb-5"
            />

            <button
              onClick={() => deposit(amount)}
              className="w-full py-3 rounded-lg border border-white/30 hover:border-white transition tracking-wide"
            >
              Deposit
            </button>
          </div>

          {/* Withdraw */}
          <div className="bg-[#1f2228] p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-medium mb-4 tracking-wide">
                Withdraw
              </h3>
              <p className="text-sm text-white/40">
                Funds unlock after 7 days from deposit.
              </p>
            </div>

            <button
              onClick={() => withdraw(amount)}
              disabled={!canWithdraw}
              className={`w-full py-3 rounded-lg mt-8 border transition tracking-wide ${
                canWithdraw
                  ? "border-white/40 hover:border-white"
                  : "border-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Withdraw
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}