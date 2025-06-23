import { ethers } from "hardhat"

async function main() {
  const ID_FACTORY_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" // your IdFactory address
  const TREX_FACTORY_ADDRESS = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318" // your TREXFactory address

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
