import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed TREXFactory address here ---
  const TREX_FACTORY_ADDRESS = "0xF7aE103AacD84641Fa0c43860C23a8Cf7cE5DB5a" // The address from TREXProxy/07-deploy-trex-factory.ts

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
