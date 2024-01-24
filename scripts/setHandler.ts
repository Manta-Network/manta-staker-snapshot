import { ethers } from "hardhat";
import { StakerBind } from "../typechain";

async function main() {
  const [admin] = await ethers.getSigners();

  const stakerBindFactory = await ethers.getContractFactory("StakerBind");

  stakerBindFactory.connect(admin);

  const contract = await stakerBindFactory.attach(
    "0xd5CF9915C7de4Bf11Ed5B5450D40407892cB4ffE" // The deployed contract address
  );

  console.log(contract);

  await sendTxn(
    contract.setHandler(admin.address, true),
    "set StakerBind handler"
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
