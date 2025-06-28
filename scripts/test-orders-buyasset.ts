import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Testing buyAsset function with account:", deployer.address)
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  )

  // Orders contract address from our deployment
  const ordersAddress = "0x0070EA7A0CAD2Fb571DE4B90Cc1DdEA9268aDc0f"

  // Orders contract ABI - just the function we need
  const ordersABI = [
    "function buyAsset(string memory asset, string memory ticker, address token, uint256 usdcAmount, uint64 subscriptionId, address orderAddr) external",
    "function pendingBuyOrders(bytes32 requestId) external view returns (address user, string ticker, address token, uint256 usdcAmount, address orderAddr)",
    "event BuyOrderCreated(address indexed user, string ticker, address token, uint256 usdcAmount, uint256 assetAmount, uint256 price)",
  ]

  // Connect to the Orders contract
  const orders = new ethers.Contract(ordersAddress, ordersABI, deployer)

  // Parameters from your interface
  const asset = "lqd"
  const ticker = "lqd"
  const token = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB"
  const usdcAmount = 100
  const subscriptionId = 379
  const orderAddr = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"

  console.log("\n📋 Calling buyAsset with parameters:")
  console.log("- asset:", asset)
  console.log("- ticker:", ticker)
  console.log("- token:", token)
  console.log("- usdcAmount:", usdcAmount)
  console.log("- subscriptionId:", subscriptionId)
  console.log("- orderAddr:", orderAddr)

  try {
    console.log("\n🔄 Executing buyAsset transaction...")

    // Call buyAsset function
    const tx = await orders.buyAsset(
      asset,
      ticker,
      token,
      usdcAmount,
      subscriptionId,
      orderAddr
    )

    console.log("✅ Transaction sent! Hash:", tx.hash)
    console.log("⏳ Waiting for confirmation...")

    const receipt = await tx.wait()
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber)
    console.log("⛽ Gas used:", receipt.gasUsed.toString())

    // Log any events emitted
    if (receipt.events && receipt.events.length > 0) {
      console.log("\n📡 Events emitted:")
      receipt.events.forEach((event, index) => {
        console.log(`Event ${index + 1}:`, event.event || "Unknown Event")
        console.log("Topics:", event.topics)
        if (event.args) {
          console.log("Args:", event.args)
        }
      })
    }

    console.log("\n✅ buyAsset function executed successfully!")
    console.log(
      "🔗 View on BaseScan:",
      `https://sepolia.basescan.org/tx/${tx.hash}`
    )
  } catch (error) {
    console.error("\n❌ Error calling buyAsset:", error)

    if (error.reason) {
      console.error("Reason:", error.reason)
    }
    if (error.code) {
      console.error("Error code:", error.code)
    }
    if (error.data) {
      console.error("Error data:", error.data)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
