import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed contract addresses here ---
  const IA_ADDRESS = "0xBD456121D833e3d29Ef83c86f8dc57c97630878A" // <-- Replace with deployed TREXImplementationAuthority address
  const FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // <-- Replace with deployed TREXFactory address
  const IA_FACTORY_ADDRESS = "0x718421BB9a6Bb63D4A63295d59c12196c3e221Ed" // <-- Replace with deployed IAFactory address

  const [deployer] = await ethers.getSigners()
  console.log("Using deployer:", deployer.address)

  const ia = await ethers.getContractAt(
    "TREXImplementationAuthority",
    IA_ADDRESS
  )

  // Set TREXFactory address
  console.log("Setting TREXFactory address...")
  const tx1 = await ia.setTREXFactory(FACTORY_ADDRESS)
  await tx1.wait()
  console.log("✅ TREXFactory address set to:", FACTORY_ADDRESS)

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
