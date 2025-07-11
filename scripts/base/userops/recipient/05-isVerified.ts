const { ethers } = require("hardhat")

async function main() {
  // Replace with your deployed IdentityRegistry address
  const identityRegistryAddress = "0x296D988cd8193D5c67a71A68E9Bdf533f53f943E"
  // Replace with the RECIPIENT wallet address you want to check (NOT ClaimIssuer)
  const walletToCheck = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717" // Recipient wallet

  const identityRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry",
    identityRegistryAddress
  )

  // Fetch both statuses
  const isRegistered = await identityRegistry.identity(walletToCheck)
  const isVerified = await identityRegistry.isVerified(walletToCheck)

  console.log(`isRegistered: ${isRegistered}`)
  console.log(`isVerified: ${isVerified}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
