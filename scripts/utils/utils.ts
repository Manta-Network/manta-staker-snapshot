import { keccak256, Signature, solidityPacked } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { ethers, run } from "hardhat";
const fs = require("fs");
const path = require("path");

/**
 *
 * @param handler handler of Staker
 * @param atlanticAddress atlantic address
 * @param pacificAddress pacific address
 * @param nonce account nonce on Staker
 * @param chainId chain id
 * @param contractAddress AirdropController address
 * @returns
 */
export async function generateStakerSignature(
  handler: HardhatEthersSigner,
  atlanticAddress: string,
  pacificAddress: string,
  nonce: number,
  chainId: number,
  contractAddress: string
) {
  // generate signature

  const dataContent = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "address", "uint32"],
    [atlanticAddress, pacificAddress, nonce]
  );

  const dataToSign = keccak256(
    solidityPacked(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        getDomainSeparator(chainId, contractAddress),
        keccak256(dataContent),
      ]
    )
  );
  const signature = await handler.signMessage(ethers.getBytes(dataToSign));

  const sig = Signature.from(signature);

  return {
    atlanticAddress: atlanticAddress,
    pacificAddress: pacificAddress,
    nonce: nonce,
    sig: sig,
  };
}

function getDomainSeparator(chainId: number, contractAddress: string) {
  const DOMAIN_SEPARATOR_TYPEHASH =
    "0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218";

  return keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address"],
      [DOMAIN_SEPARATOR_TYPEHASH, chainId, contractAddress]
    )
  );
}

export async function contractAt(
  name: string,
  address: string,
  provider: HardhatEthersProvider | HardhatEthersSigner,
  options?: any
) {
  let contractFactory = await ethers.getContractFactory(name, options);
  if (provider) {
    contractFactory = contractFactory.connect(provider);
  }
  return await contractFactory.attach(address);
}

const contractAddressesFilepath = path.join(
  __dirname,
  "..",
  "..",
  "contractAddress",
  `contract-addresses-${process.env.HARDHAT_NETWORK || "local"}.json`
);

export async function readContractAddress() {
  if (fs.existsSync(contractAddressesFilepath)) {
    return JSON.parse(fs.readFileSync(contractAddressesFilepath));
  }
  return {};
}

export async function sendTxn(txnPromise: any, label?: string) {
  const txn = await txnPromise;
  console.info(`Sending ${label}...`);
  await txn.wait(1);
  console.info(`... Sent! ${txn.hash}`);
  return txn;
}

export async function verifyContract(contractAddress: string, args: any[]) {
  await callWithRetries(run, [
    "verify:verify",
    {
      address: contractAddress,
      constructorArguments: args,
    },
  ]);
}

async function callWithRetries(func: any, args: any[], retriesCount = 3) {
  let i = 0;
  while (true) {
    i++;
    try {
      return await func(...args);
    } catch (ex: any) {
      if (i === retriesCount) {
        console.error("call failed %s times. throwing error", retriesCount);
        throw ex;
      }
      console.error("call i=%s failed. retrying....", i);
      console.error(ex.message);
    }
  }
}
