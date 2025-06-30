import { ethers } from "hardhat"

async function main() {
  console.log("Deploying logic contract for ModularCompliance...")
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

  const ModularCompliance = await ethers.getContractFactory(
    "contracts/ERC3643/compliance/modular/ModularCompliance.sol:ModularCompliance"
  )
  const modularComplianceLogic = await ModularCompliance.deploy(overrides)
  await modularComplianceLogic.deployed()

  console.log(
    "✅ ModularCompliance logic deployed at:",
    modularComplianceLogic.address
  )
  console.log(
    "\nNOTE: Please copy this address for the final registration step."
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  })
