import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("🔍 Debugging Chainlink Functions setup")
  console.log("Account:", deployer.address)

  // Orders contract address
  const ordersAddress = "0x0070EA7A0CAD2Fb571DE4B90Cc1DdEA9268aDc0f"

  // Chainlink Router address for Base Sepolia (from the contract)
  const routerAddress = "0xf9B8fc078197181C841c296C876945aaa425B278"

  // Basic ABI for debugging
  const ordersABI = [
    "function getAssetPrice(string memory asset, uint64 subscriptionId) external returns (bytes32)",
    "function assetToPrice(string memory asset) external view returns (uint256)",
    "function requestIdToAsset(bytes32 requestId) external view returns (string memory)",
  ]

  // Chainlink Functions Router ABI (simplified)
  const routerABI = [
    "function getSubscription(uint64 subscriptionId) external view returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers)",
    "function isValidCallbackGasLimit(uint64 subscriptionId, uint32 callbackGasLimit) external view returns (bool)",
  ]

  try {
    // Connect to contracts
    const orders = new ethers.Contract(ordersAddress, ordersABI, deployer)
    const router = new ethers.Contract(routerAddress, routerABI, deployer)

    console.log("\n📋 Testing subscription ID 379...")

    // Check if subscription exists and get details
    try {
      const subscription = await router.getSubscription(379)
      console.log("✅ Subscription 379 exists!")
      console.log(
        "- Balance:",
        ethers.utils.formatEther(subscription.balance),
        "LINK"
      )
      console.log("- Request count:", subscription.reqCount.toString())
      console.log("- Owner:", subscription.owner)
      console.log("- Consumers count:", subscription.consumers.length)
      console.log("- Consumers:", subscription.consumers)

      // Check if our Orders contract is a consumer
      const isConsumer = subscription.consumers.includes(ordersAddress)
      console.log(
        "- Orders contract is consumer:",
        isConsumer ? "✅ YES" : "❌ NO"
      )

      if (!isConsumer) {
        console.log(
          "\n🚨 ISSUE FOUND: Orders contract is not added as a consumer!"
        )
        console.log(
          "📝 To fix: Add",
          ordersAddress,
          "as a consumer to subscription 379"
        )
        console.log("🔗 Go to: https://functions.chain.link/")
      }

      if (subscription.balance.eq(0)) {
        console.log("\n🚨 ISSUE FOUND: Subscription has 0 LINK balance!")
        console.log("📝 To fix: Fund the subscription with LINK tokens")
      }
    } catch (error) {
      console.log("❌ Subscription 379 does not exist or error accessing it")
      console.log("Error:", error.message)
      console.log(
        "\n📝 To fix: Create subscription 379 or use a different subscription ID"
      )
    }

    // Test a simple price lookup to see if there are existing prices
    console.log("\n📋 Checking existing asset prices...")
    try {
      const price = await orders.assetToPrice("lqd")
      console.log("Existing LQD price:", price.toString())
    } catch (error) {
      console.log("No existing LQD price found")
    }

    // Check gas limit validation
    console.log("\n📋 Checking gas limit validation...")
    try {
      const gasLimit = 300000 // From the contract
      const isValidGas = await router.isValidCallbackGasLimit(379, gasLimit)
      console.log(
        "Gas limit",
        gasLimit,
        "is valid:",
        isValidGas ? "✅ YES" : "❌ NO"
      )
    } catch (error) {
      console.log("Could not check gas limit validation:", error.message)
    }
  } catch (error) {
    console.error("❌ Error during debugging:", error)
  }

  console.log("\n💡 Recommendations:")
  console.log("1. Create Chainlink Functions subscription if needed")
  console.log("2. Add Orders contract as consumer:", ordersAddress)
  console.log("3. Fund subscription with LINK tokens (minimum 0.1 LINK)")
  console.log("4. Test with a small amount first")
  console.log(
    "\n🔗 Chainlink Functions Dashboard: https://functions.chain.link/"
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
