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
    ],
  },
  networks: {
    pharos: {
      url: "https://testnet.dplabs-internal.com",
      accounts: [vars.get("PRIVATE_KEY")],
    },
  },
  etherscan: {
    apiKey: {
      pharos: "YOUR_API_KEY", // You'll need this from Pharos
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
    ],
  },
}
