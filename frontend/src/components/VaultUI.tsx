import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { VAULT_ADDRESS, VAULT_ABI } from "../contracts/vault";

export function VaultUI() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [vaultBalance, setVaultBalance] = useState<bigint>(0n);
  const [ownerAddress, setOwnerAddress] = useState<string>("");

  // ---------------- Fetch Vault Owner ----------------
  async function fetchOwner() {
    if (!publicClient) return;
    try {
      const owner: string = await publicClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "owner",
      });
      setOwnerAddress(owner);
    } catch (err) {
      console.error("Failed to fetch owner:", err);
    }
  }

  // ---------------- Fetch Vault Contract Balance ----------------
  async function fetchVaultBalance() {
    if (!publicClient) return;
    try {
      const bal = await publicClient.getBalance({
        address: VAULT_ADDRESS,
      });
      setVaultBalance(bal);
    } catch (err) {
      console.error("Failed to fetch vault balance:", err);
    }
  }

  useEffect(() => {
    fetchOwner();
    fetchVaultBalance();
  }, [publicClient]);

  // ---------------- Read user deposit info ----------------
  const { data: userInfo, refetch } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "depoInfo",
    args: address ? [address] : undefined,
  });

  // ---------------- Deposit ----------------
  async function handleDeposit() {
    if (!depositAmount) return;

    try {
      setLoading(true);

      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "deposit",
        value: parseEther(depositAmount),
      });

      setDepositAmount("");
      refetch();
      await fetchVaultBalance();
      alert("Deposit successful!");
    } catch (error) {
      console.error("Deposit failed:", error);
      alert("Deposit failed. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Withdraw ----------------
  async function handleWithdraw() {
    if (!withdrawAmount) return;

    try {
      setLoading(true);

      if (!userInfo) {
        alert("No deposit info found");
        return;
      }

      const depositTime = Number(userInfo[1]); // seconds

      if (!(window as any).ethereum) {
        alert("MetaMask not found!");
        return;
      }

      const latestBlock: any = await (window as any).ethereum.request({
        method: "eth_getBlockByNumber",
        params: ["latest", false],
      });
      const currentTimestamp = parseInt(latestBlock.timestamp, 16);

      const sevenDays = 7 * 24 * 60 * 60; // seconds

      if (currentTimestamp < depositTime + sevenDays) {
        alert("Cannot withdraw: 7 days not completed");
        return;
      }

      const amount = parseEther(withdrawAmount);

      await writeContractAsync({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "withdraw",
        args: [amount],
      });

      setWithdrawAmount("");
      refetch();
      await fetchVaultBalance();
      alert("Withdrawal successful!");
    } catch (error: any) {
      console.error("Withdraw failed:", error);

      if (error?.cause?.reason) {
        alert("Withdraw reverted: " + error.cause.reason);
      } else if (error?.message) {
        alert("Withdraw failed: " + error.message);
      } else {
        alert("Withdraw failed. See console for details.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Render UI ----------------
  return (
    <div style={container}>
      <h1>Vault DApp</h1>

      {!isConnected ? (
        <button onClick={() => connect({ connector: connectors[0] })}>
          Connect Wallet
        </button>
      ) : (
        <>
          <div style={card}>
            <p><strong>Connected:</strong> {address}</p>
            <button onClick={() => disconnect()}>Disconnect</button>
          </div>

          {userInfo && (
            <div style={card}>
              <h3>Your Vault Info</h3>
              <p>Deposited: {formatEther(userInfo[0] as bigint)} ETH</p>
              <p>
                Deposit Time:{" "}
                {Number(userInfo[1]) > 0
                  ? new Date(Number(userInfo[1]) * 1000).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          )}

          {address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase() && (
            <div style={card}>
              <h3>Vault Contract Balance (Owner Only)</h3>
              <p>{(Number(vaultBalance) / 1e18).toFixed(4)} ETH</p>
              <button onClick={fetchVaultBalance} disabled={loading}>
                Refresh Balance
              </button>
            </div>
          )}

          <div style={card}>
            <h3>Deposit ETH</h3>
            <input
              type="text"
              placeholder="Amount in ETH"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button onClick={handleDeposit} disabled={loading}>
              {loading ? "Processing..." : "Deposit"}
            </button>
          </div>

          <div style={card}>
            <h3>Withdraw ETH</h3>
            <input
              type="text"
              placeholder="Amount in ETH"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <button onClick={handleWithdraw} disabled={loading}>
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Styles ----------------
const container: React.CSSProperties = {
  padding: "40px",
  maxWidth: "500px",
  margin: "auto",
  fontFamily: "Arial",
};

const card: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};