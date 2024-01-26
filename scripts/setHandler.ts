import { ethers } from "hardhat";
import { Staker } from "../typechain";

async function main() {
  const [deployer] = await ethers.getSigners();

  const stakerContractFactory = await ethers.getContractFactory("Staker");

  stakerContractFactory.connect(deployer);

  const contract = await stakerContractFactory.attach(
    "0x6381c9ac6FaBbC88f33F754B5D264Ca578Fe5ABc" // The deployed Staker contract address
  );

  await sendTxn(
    contract.setHandler(deployer.address, true),
    "set Staker handler"
  );
}

main();

export async function sendTxn(txnPromise: any, label?: string) {
  const txn = await txnPromise;
  console.info(`Sending ${label}...`);
  await txn.wait(1);
  console.info(`... Sent! ${txn.hash}`);
  return txn;
}
