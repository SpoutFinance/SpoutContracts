import { ethers } from "hardhat"

async function main() {
  const factoryAddress = "0xYourFactoryAddress" // Replace with your deployed factory address
  const trexFactory = await ethers.getContractAt("TREXFactory", factoryAddress)

  const tokenDetails = {
    /* ... */
  }
  const claimDetails = {
    /* ... */
  }

  await trexFactory.deployTREXSuite(
    "YourUniqueSalt",
    tokenDetails,
    claimDetails
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
