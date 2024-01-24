import { ethers } from "hardhat";
import { Staker } from "../typechain";

async function main() {
  const [deployer] = await ethers.getSigners();

  const stakerContractFactory = await ethers.getContractFactory("Staker");

  stakerContractFactory.connect(deployer);

  const contract = await stakerContractFactory.attach(
    "0x3AFc3061d4F487ab9C469BfDbfcf4B5a1dCa3657" // The deployed Staker contract address
  );

  console.log(contract);

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
