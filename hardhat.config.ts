import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  networks: {
    "pacific-testnet": {
      chainId: 3441005,
      url: process.env.MANTA_PACIFIC_RPC as string,
      accounts: [process.env.DEPLOYER_KEY as string],
      gas: parseInt(process.env.GASLIMIT as string),
    },
  },
  etherscan: {
    apiKey: {
      "pacific-testnet": "abc",
    },
    customChains: [
      {
        network: "pacific-testnet",
        chainId: 3441005,
        urls: {
          apiURL: "https://manta-testnet.calderaexplorer.xyz/api",
          browserURL: "https://manta-testnet.calderaexplorer.xyz/",
        },
      },
    ],
  },
};

export default config;
