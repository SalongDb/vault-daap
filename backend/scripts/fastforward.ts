import hre from "hardhat";

async function main() {
  const { networkHelpers } = await hre.network.connect();

  // Fast-forward 7 days
  const sevenDays = 7 * 24 * 60 * 60; // seconds
  await networkHelpers.time.increase(sevenDays);
  await networkHelpers.mine();

  console.log("Fast-forwarded 7 days");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});