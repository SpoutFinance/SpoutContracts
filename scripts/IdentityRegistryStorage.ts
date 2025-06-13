import { ethers } from "hardhat"

async function main() {
  // Get the contract factory
  const IdentityRegistryStorage = await ethers.getContractFactory(
    "IdentityRegistryStorage"
  )

  // Deploy the contract
  const identityRegistryStorage = await IdentityRegistryStorage.deploy()
  await identityRegistryStorage.deployed()

  console.log(
    "IdentityRegistryStorage deployed to:",
    identityRegistryStorage.address
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
