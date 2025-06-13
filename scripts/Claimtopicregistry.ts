import { ethers } from "hardhat"

async function main() {
  // Get the contract factory
  const ClaimTopicsRegistry = await ethers.getContractFactory(
    "ClaimTopicsRegistry"
  )

  // Deploy the contract
  const claimTopicsRegistry = await ClaimTopicsRegistry.deploy()
  await claimTopicsRegistry.deployed()

  console.log("ClaimTopicsRegistry deployed to:", claimTopicsRegistry.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
