import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed IdentityRegistryProxy address here ---
  const identityRegistryAddress = "0x296D988cd8193D5c67a71A68E9Bdf533f53f943E" // <-- Replace if needed
  // --- Paste the user's wallet address here ---
  const userWalletAddress = "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55" // <-- Replace with the user's wallet address
  // --- Paste the ONCHAINID address here ---
  const onchainIdAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F" // <-- Replace with the ONCHAINID address
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
