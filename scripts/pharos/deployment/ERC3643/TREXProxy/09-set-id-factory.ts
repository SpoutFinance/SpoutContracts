import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed TREXFactory address here ---
  const TREX_FACTORY_ADDRESS = "0xF7aE103AacD84641Fa0c43860C23a8Cf7cE5DB5a" // The address from TREXProxy/07-deploy-trex-factory.ts
  const ID_FACTORY_ADDRESS = "0x18cB5F2774a80121d1067007933285B32516226a" // The address from OnchainID/04-deploy-id-factory.ts

  const [deployer] = await ethers.getSigners()
  console.log("Using deployer:", deployer.address)

  const trexFactory = await ethers.getContractAt(
    "TREXFactory",
    TREX_FACTORY_ADDRESS
  )

  console.log("Setting IdFactory address in TREXFactory...")
  const tx = await trexFactory.setIdFactory(ID_FACTORY_ADDRESS)
  await tx.wait()
  console.log("✅ IdFactory address set in TREXFactory:", ID_FACTORY_ADDRESS)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
