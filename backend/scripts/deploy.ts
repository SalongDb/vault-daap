import hre from "hardhat";

async function main() {
  const { viem } = await hre.network.connect();

  // Get deployer wallet
  const [deployer] = await viem.getWalletClients();
  console.log("Deploying Vault with account:", deployer.account.address);

  // Deploy Vault
  const vault = await viem.deployContract("Vault");
  console.log("Vault deployed at:", vault.address);

  // Initial balance check (should be 0)
  const balance = await viem.getPublicClient().then(client =>
    client.getBalance({ address: vault.address })
  );
  console.log("Initial Vault balance:", balance, "wei");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});