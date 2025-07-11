import { ethers } from "hardhat"

async function main() {
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // The address from TREXProxy/07-deploy-trex-factory.ts
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // The address from OnchainID/04-deploy-id-factory.ts

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
