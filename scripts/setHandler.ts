import { ethers } from "hardhat";
import { Staker } from "../typechain";

async function main() {
  const [admin] = await ethers.getSigners();

  const stakerContractFactory = await ethers.getContractFactory("Staker");

  stakerContractFactory.connect(admin);

  const contract = await stakerContractFactory.attach(
    "0xd5CF9915C7de4Bf11Ed5B5450D40407892cB4ffE" // The deployed contract address
  );

  console.log(contract);

  await sendTxn(contract.setHandler(admin.address, true), "set Staker handler");
}

main();

export async function sendTxn(txnPromise: any, label?: string) {
  const txn = await txnPromise;
  console.info(`Sending ${label}...`);
  await txn.wait(1);
  console.info(`... Sent! ${txn.hash}`);
  return txn;
}
