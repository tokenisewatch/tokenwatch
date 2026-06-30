import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const WatchVault = await ethers.getContractFactory("WatchVault");
  const vault = await WatchVault.deploy();
  await vault.waitForDeployment();

  const address = await vault.getAddress();
  console.log("WatchVault deployed to:", address);

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/WatchVault.sol/WatchVault.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const abiDir = path.join(__dirname, "../lib/abi");
  fs.mkdirSync(abiDir, { recursive: true });
  fs.writeFileSync(
    path.join(abiDir, "WatchVault.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("ABI copied to lib/abi/WatchVault.json");

  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_WATCH_VAULT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
