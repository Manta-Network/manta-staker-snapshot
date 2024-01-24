import { ethers, upgrades } from "hardhat";
import { Staker } from "../typechain";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // deploy staker contract
  const StakerFactory = await ethers.getContractFactory("Staker", deployer);
  const stakerInstance = (await upgrades.deployProxy(StakerFactory, [], {
    initializer: "initialize",
  })) as any as Staker;

  await stakerInstance.waitForDeployment();

  console.log("Staker deployed, address: ", await stakerInstance.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
