import { useEffect, useState } from "react";

interface Props {
  balance: string;
  depositTimestamp: number;
  lockPeriod: number;
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
  const [amount, setAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!depositTimestamp) return;

      const unlockTime = depositTimestamp + lockPeriod;
      const now = Math.floor(Date.now() / 1000);
      const remaining = unlockTime - now;

      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [depositTimestamp, lockPeriod]);

  const progress =
    depositTimestamp !== 0
      ? ((lockPeriod - timeLeft) / lockPeriod) * 100
      : 0;

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

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

        {/* Progress Section */}
        {depositTimestamp !== 0 && (
          <div className="mb-12">
            <div className="flex justify-between text-sm text-white/50 mb-3">
              <span>Lock Progress</span>
              <span>{formatTime(timeLeft)} left</span>
            </div>

            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Deposit + Withdraw Grid */}
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
              className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 mb-5 focus:outline-none focus:border-white/60 transition"
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