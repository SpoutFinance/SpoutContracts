import { ethers } from "hardhat"

async function main() {
  // Get the contract factory
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry")

  // Deploy the contract
  const identityRegistry = await IdentityRegistry.deploy()
  await identityRegistry.deployed()

  console.log("IdentityRegistry deployed to:", identityRegistry.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
