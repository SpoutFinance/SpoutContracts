# Spout RWA Token

Spout RWA Token is a project focused on the tokenization of Real World Assets (RWA) on the Ethereum blockchain. This repository provides a robust starting point for developing, deploying, and interacting with smart contracts that represent real-world assets as on-chain tokens.

This project leverages Hardhat for smart contract development, testing, and deployment, and includes a sample frontend Dapp for interacting with your RWA tokens.

## Quick start

Clone this repository and install its dependencies:

```sh
git clone <your-repo-url>
cd spout-rwa-token
npm install
```

Start the local Hardhat network:

```sh
npx hardhat node
```

In a new terminal, deploy your RWA token contract:

```sh
npx hardhat run scripts/deploy.js --network localhost
```

To run the frontend Dapp:

```sh
cd frontend
npm install
npm start
```

Open [http://localhost:3000/](http://localhost:3000/) to interact with your RWA token. You will need a wallet like [Coinbase Wallet](https://www.coinbase.com/wallet) or [Metamask](https://metamask.io) connected to `localhost 8545`.

## User Guide

- Write and compile your RWA token contracts in the `contracts` directory.
- Use the `scripts` directory for deployment and interaction scripts.
- Test your contracts in the `test` directory using Mocha and Chai.
- The `frontend` directory contains a React-based Dapp for interacting with your deployed contracts.

For more information on Hardhat, see the [Hardhat documentation](https://hardhat.org/docs/).

## What's Included?

This repository uses the recommended Hardhat setup with [`@nomicfoundation/hardhat-toolbox`](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox), enabling you to:

- Deploy and interact with contracts using [ethers.js](https://docs.ethers.io/v5/).
- Test contracts with Mocha, Chai, and Hardhat Chai Matchers.
- Interact with Hardhat Network Helpers.
- Verify contract source code with hardhat-etherscan.
- Get gas usage metrics with hardhat-gas-reporter.
- Measure test coverage with solidity-coverage.

A sample frontend Dapp is included in the [frontend](./frontend) directory, built with Create React App.

## Troubleshooting

- `Invalid nonce` errors: If you see this error on the `npx hardhat node` console, try resetting your Metamask account. This will reset the account's transaction history and nonce. Open Metamask, go to `Settings > Advanced > Clear activity tab data`.

## Setting up your editor

[Hardhat for Visual Studio Code](https://hardhat.org/hardhat-vscode) is the official extension for Solidity support in VSCode. If you use VSCode, give it a try!

## Getting help and updates

For help with this project or Hardhat in general, see the [Hardhat help guide](https://hardhat.org/hardhat-runner/docs/guides/getting-help).

Stay updated by following [Hardhat on Twitter](https://twitter.com/HardhatHQ) and starring [their GitHub repository](https://github.com/NomicFoundation/hardhat).

**Happy _building_ Real World Asset tokens with Spout!**
