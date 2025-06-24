import { ethers } from "hardhat"

async function main() {
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // your IdFactory address
  const TREX_FACTORY_ADDRESS = "0x50c88ac21f82AC78A4A72BD30fbbfc70239cA899" // your TREXFactory address

  const [deployer] = await ethers.getSigners()
  console.log("Registering TREXFactory as token factory in IdFactory...")
  const IdFactory = await ethers.getContractFactory("IdFactory")
  const idFactory = IdFactory.attach(ID_FACTORY_ADDRESS)

  const tx = await idFactory.addTokenFactory(TREX_FACTORY_ADDRESS)
  await tx.wait()

  console.log("✅ TREXFactory registered as token factory in IdFactory!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
