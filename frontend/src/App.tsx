import "./App.css";
import { useAccount, useBalance, useConnect, useDisconnect, useReadContract, useWriteContract } from "wagmi";
import Navbar from "./components/Navbar";
import WelcomeCard from "./components/WelcomeCard";
import TransactionUI from "./components/TransactionUI";
import { formatEther, parseEther } from "viem";
import { vaultContractConfig } from "./contracts/vault";

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  //Getting user wallet Balance
  const { data: balance } = useBalance({
    address,
  });
  const formattedBalance = balance ? formatEther(balance.value) : "0";

  //Getting depoTime
  type UserDepoInfoTuple = [bigint, bigint];
  const { data } = useReadContract({
    ...vaultContractConfig,
    functionName: "depoInfo",
    args: [address],
  })
  const depoTuple = data as UserDepoInfoTuple | undefined;
  const depoTime = depoTuple?.[1] ?? 0n;
  const depositTimestamp = Number(depoTime);

  //Lock period 7 days
  const lockPeriod = 7 * 24 * 60 * 60;

  const { writeContract } = useWriteContract()

  // Deposit ETH into the vault
  function depositETH (amount: string) {
    writeContract({
      ...vaultContractConfig,
      functionName: 'deposit',
      args: [],
      value: parseEther(amount),
    })
  }

  // withdraw ETH into the vault
  function withdrawETH (amount: string) {
    writeContract({
      ...vaultContractConfig,
      functionName: 'withdraw',
      args: [parseEther(amount)],
    })
  }


    return (
      <div className="min-h-screen bg-[#1a1d23] relative overflow-hidden">

        {/* subtle background layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#232730] via-[#1a1d23] to-[#14161a] -z-10" />

        <Navbar
          address={address}
          isConnected={isConnected}
          onConnect={() => connect({ connector: connectors[0] })}
          onDisconnect={disconnect}
        />

        {isConnected ? (
          <TransactionUI
            balance={formattedBalance}
            depositTimestamp={depositTimestamp}
            lockPeriod={lockPeriod}
            deposit={depositETH}
            withdraw={withdrawETH}
          />
        ) : (
          <WelcomeCard />
        )}
      </div>
    );
  }

  export default App;