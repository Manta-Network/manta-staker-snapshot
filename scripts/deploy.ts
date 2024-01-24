import { ethers } from "hardhat";
import { StakerBind } from "../typechain";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const stakerBind = await ethers.deployContract("StakerBind");

  console.log("StakerBind address:", await stakerBind.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
