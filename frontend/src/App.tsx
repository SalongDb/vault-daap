import "./App.css";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Navbar from "./components/Navbar";
import WelcomeCard from "./components/WelcomeCard";
import TransactionUI from "./components/TransactionUI";

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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

  {isConnected ? <TransactionUI /> : <WelcomeCard />}
</div>
  );
}

export default App;