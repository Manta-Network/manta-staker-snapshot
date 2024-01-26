import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import "@openzeppelin/hardhat-upgrades";
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
      url: process.env.MANTA_PACIFIC_TESTNET_RPC as string,
      accounts: [process.env.TESTNET_DEPLOYER_KEY as string],
      gas: parseInt(process.env.GASLIMIT as string),
    },
    "pacific-mainnet": {
      chainId: 169,
      url: process.env.MANTA_PACIFIC_MAINNET_RPC as string,
      accounts: [process.env.MAINNET_DEPLOYER_KEY as string],
      gas: parseInt(process.env.GASLIMIT as string),
    },
  },
  etherscan: {
    apiKey: {
      "pacific-testnet": "abc",
      "pacific-mainnet": "abc",
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
      {
        network: "pacific-mainnet",
        chainId: 169,
        urls: {
          apiURL: "https://manta-pacific.calderaexplorer.xyz/api",
          browserURL: "https://manta-pacific.calderaexplorer.xyz/",
        },
      },
    ],
  },
};

export default config;
