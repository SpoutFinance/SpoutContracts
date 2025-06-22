import { ethers } from "hardhat"

async function main() {
  console.log("Deploying FunctionAssetConsumer for market data...")
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

  const FunctionAssetConsumer = await ethers.getContractFactory(
    "contracts/SpoutV1/Marketdata/FunctionAssetConsumer.sol:FunctionAssetConsumer"
  )
  const marketDataConsumer = await FunctionAssetConsumer.deploy(overrides)
  await marketDataConsumer.deployed()

  console.log("✅ FunctionAssetConsumer deployed at:", marketDataConsumer.address)
  console.log("\nNOTE: This contract requires Chainlink Functions subscription setup.")
  console.log("You'll need to:")
  console.log("1. Create a Chainlink Functions subscription")
  console.log("2. Fund the subscription with LINK tokens")
  console.log("3. Add this contract as an authorized consumer")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  }) 