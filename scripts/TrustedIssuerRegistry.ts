import { ethers } from "hardhat"

async function main() {
  // Get the contract factory
  const TrustedIssuersRegistry = await ethers.getContractFactory(
    "TrustedIssuersRegistry"
  )

  // Deploy the contract
  const trustedIssuersRegistry = await TrustedIssuersRegistry.deploy()
  await trustedIssuersRegistry.deployed()

  console.log(
    "TrustedIssuersRegistry deployed to:",
    trustedIssuersRegistry.address
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
