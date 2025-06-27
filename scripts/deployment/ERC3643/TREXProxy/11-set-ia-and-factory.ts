import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed contract addresses here ---
  const TREX_IA_ADDRESS = "0xBD456121D833e3d29Ef83c86f8dc57c97630878A" // The address from logic/04-deploy-implementation-authority.ts
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // The address from TREXProxy/07-deploy-trex-factory.ts
  const IA_FACTORY_ADDRESS = "0x718421BB9a6Bb63D4A63295d59c12196c3e221Ed" // <-- The address from TREXProxy/10-deploy-ia-factory.ts

  const [deployer] = await ethers.getSigners()
  console.log("Using deployer:", deployer.address)

  const ia = await ethers.getContractAt(
    "TREXImplementationAuthority",
    TREX_IA_ADDRESS
  )

  // Set TREXFactory address
  console.log("Setting TREXFactory address...")
  const tx1 = await ia.setTREXFactory(TREX_FACTORY_ADDRESS)
  await tx1.wait()
  console.log("✅ TREXFactory address set to:", TREX_FACTORY_ADDRESS)

  // Set IAFactory address
  console.log("Setting IAFactory address...")
  const tx2 = await ia.setIAFactory(IA_FACTORY_ADDRESS)
  await tx2.wait()
  console.log("✅ IAFactory address set to:", IA_FACTORY_ADDRESS)

  console.log("\n🚀 Implementation Authority is now fully configured!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
