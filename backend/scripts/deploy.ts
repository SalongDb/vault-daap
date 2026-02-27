import { network } from "hardhat";

async function main() {
  console.log("🚀 Deploying Vault contract to Sepolia...");

  // Connect to selected network (this is key in Hardhat v3)
  const connection = await network.connect();

  const viem = connection.viem;

  const [walletClient] = await viem.getWalletClients();

  console.log("👤 Deployer address:", walletClient.account.address);

  const vault = await viem.deployContract("Vault", []);

  console.log("✅ Vault deployed successfully!");
  console.log("📍 Contract address:", vault.address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});