import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed IdentityRegistryProxy address here ---
  const identityRegistryAddress = "0x296D988cd8193D5c67a71A68E9Bdf533f53f943E"
  // --- Paste the user address to check here ---
  const userAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717" // <-- Replace with the user address

  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  )
  const identityRegistry = IdentityRegistry.attach(identityRegistryAddress)

  const isVerified = await identityRegistry.isVerified(userAddress)
  console.log(
    `User ${userAddress} is ${
      isVerified ? "✅ VERIFIED" : "❌ NOT VERIFIED"
    } in the IdentityRegistry.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
