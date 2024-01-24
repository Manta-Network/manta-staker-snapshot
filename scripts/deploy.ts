import { ethers } from "hardhat";
import { Staker } from "../typechain";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const stakerContract = await ethers.deployContract("Staker");

  console.log("Staker address:", await stakerContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
