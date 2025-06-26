require("@nomicfoundation/hardhat-toolbox")
const { vars } = require("hardhat/config")

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    pharos: {
      url: "https://testnet.dplabs-internal.com",
      accounts: [vars.get("PRIVATE_KEY")],
    },
    "base-sepolia": {
      url: "https://base-sepolia.g.alchemy.com/v2/jZMXG1ZQfY6Yvu_PmDJxWrasqdnym3Uy",
      accounts: [vars.get("PRIVATE_KEY")],
    },
  },
  etherscan: {
    apiKey: {
      pharos: "YOUR_API_KEY", // You'll need this from Pharos
      "base-sepolia": "YOUR_BASESCAN_API_KEY", // Get this from https://basescan.org/
    },
    customChains: [
      {
        network: "Pharos Testnet",
        chainId: 688688,
        urls: {
          apiURL: "https://testnet.dplabs-internal.com/api",
          browserURL: "https://testnet.pharosscan.xyz/",
        },
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
}
