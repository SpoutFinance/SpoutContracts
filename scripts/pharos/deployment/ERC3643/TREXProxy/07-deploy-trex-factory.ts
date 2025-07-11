import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                       PASTE YOUR ADDRESSES HERE
  // --------------------------------------------------------------------------------------------
  const TREX_IA_ADDRESS = "0xf3aDF2423C7aaBbd4Ad3ED8150F07036d2503335" // The address from logic/04-deploy-implementation-authority.ts
  const ID_FACTORY_ADDRESS = "0x18cB5F2774a80121d1067007933285B32516226a" // The address from OnchainID/04-deploy-id-factory.ts
  // --------------------------------------------------------------------------------------------

  console.log("Deploying the TREXFactory...")
  const [deployer] = await ethers.getSigners()
  console.log("Deploying from:", deployer.address)

  const feeData = await ethers.provider.getFeeData()
  const maxFeePerGas =
    feeData.maxFeePerGas ?? ethers.utils.parseUnits("5", "gwei")
  const maxPriorityFeePerGas =
    feeData.maxPriorityFeePerGas ?? ethers.utils.parseUnits("2", "gwei")

  const overrides = {
    maxFeePerGas: maxFeePerGas.add(ethers.utils.parseUnits("5", "gwei")),
    maxPriorityFeePerGas: maxPriorityFeePerGas.add(
      ethers.utils.parseUnits("2", "gwei")
    ),
  }

  console.log(
    `\nUsing dynamic fees → Max Fee Per Gas: ${ethers.utils.formatUnits(
      overrides.maxFeePerGas!,
      "gwei"
    )} Gwei | Priority Fee: ${ethers.utils.formatUnits(
      overrides.maxPriorityFeePerGas!,
      "gwei"
    )} Gwei\n`
  )

  const TREXFactory = await ethers.getContractFactory(
    "contracts/ERC3643/factory/TREXFactory.sol:TREXFactory"
  )
  const trexFactory = await TREXFactory.deploy(
    TREX_IA_ADDRESS,
    ID_FACTORY_ADDRESS,
    overrides
  )
  await trexFactory.deployed()

  console.log("✅ TREXFactory deployed at:", trexFactory.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  })
