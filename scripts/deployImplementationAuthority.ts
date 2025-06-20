import { ethers } from "hardhat"

async function main() {
  // Set constructor arguments
  const referenceStatus = true // This is the main/reference IA
  const trexFactory = ethers.constants.AddressZero // Placeholder, set after deploying factory
  const iaFactory = ethers.constants.AddressZero // Placeholder, set after deploying IAFactory if needed

  // Get the contract factory
  const ImplementationAuthority = await ethers.getContractFactory(
    "TREXImplementationAuthority"
  )

  // Deploy the contract
  const ia = await ImplementationAuthority.deploy(
    referenceStatus,
    trexFactory,
    iaFactory
  )
  await ia.deployed()

  console.log("TREXImplementationAuthority deployed to:", ia.address)
  console.log("\nNext steps:")
  console.log(
    "1. Deploy the TREXFactory, passing this address as the implementationAuthority argument."
  )
  console.log(
    "2. Call setTREXFactory on the ImplementationAuthority with the factory's address."
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
