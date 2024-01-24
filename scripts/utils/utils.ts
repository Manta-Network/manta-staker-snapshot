import { keccak256, Signature, solidityPacked } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";

/**
 *
 * @param handler handler of StakerBind
 * @param atlanticAddress atlantic address
 * @param pacificAddress pacific address
 * @param nonce account nonce on StakerBind
 * @param chainId chain id
 * @param contractAddress AirdropController address
 * @returns
 */
export async function generateStakerBindSignature(
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
