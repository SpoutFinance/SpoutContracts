import { ethers } from "hardhat"

async function main() {
  const ID_FACTORY_ADDRESS = "0xA37b1f4D5a8876184D62b9097335A4f4555b7c5f" // your IdFactory address
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // your TREXFactory address

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
