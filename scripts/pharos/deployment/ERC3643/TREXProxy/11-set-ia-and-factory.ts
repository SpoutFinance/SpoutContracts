import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed contract addresses here ---
  const TREX_IA_ADDRESS = "0xf3aDF2423C7aaBbd4Ad3ED8150F07036d2503335" // The address from logic/04-deploy-implementation-authority.ts
  const TREX_FACTORY_ADDRESS = "0xF7aE103AacD84641Fa0c43860C23a8Cf7cE5DB5a" // The address from TREXProxy/07-deploy-trex-factory.ts
  const IA_FACTORY_ADDRESS = "0xc996D92baB216448A890A8a9EBD333d93B32d9EC" // <-- The address from TREXProxy/10-deploy-ia-factory.ts

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
