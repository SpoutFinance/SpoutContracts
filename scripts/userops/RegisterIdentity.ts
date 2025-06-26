import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed IdentityRegistryProxy address here ---
  const identityRegistryAddress = "0x296D988cd8193D5c67a71A68E9Bdf533f53f943E" // <-- Replace if needed
  // --- Paste the user's wallet address here ---
  const userWalletAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717" // <-- Replace with the user's wallet address
  // --- Paste the ONCHAINID address here ---
  const onchainIdAddress = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B" // <-- Replace with the ONCHAINID address
  // --- Set the country code (uint16) ---
  const country = 1 // <-- Replace with the user's country code

  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  )
  const identityRegistry = IdentityRegistry.attach(identityRegistryAddress)

  const tx = await identityRegistry.registerIdentity(
    userWalletAddress,
    onchainIdAddress,
    country
  )
  await tx.wait()
  console.log("✅ Registered ONCHAINID for user in IdentityRegistry")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
