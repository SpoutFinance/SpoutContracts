import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed TREXFactory address here ---
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // The address from TREXProxy/07-deploy-trex-factory.ts

  const [deployer] = await ethers.getSigners()
  console.log("Deploying IAFactory from:", deployer.address)

  const IAFactory = await ethers.getContractFactory("IAFactory")
  const iaFactory = await IAFactory.deploy(TREX_FACTORY_ADDRESS)
  await iaFactory.deployed()

  console.log("✅ IAFactory deployed at:", iaFactory.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
