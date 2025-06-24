import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed TREXFactory address here ---
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // <-- Replace with deployed TREXFactory address
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // New IdFactory address

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
