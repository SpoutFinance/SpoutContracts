import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("🧪 Testing FIXED Orders contract buyAsset function")
  console.log("Testing with account:", deployer.address)
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  )

  // Contract addresses (properly checksummed)
  const ordersAddress = "0xf160191ce959cb26595c8e6eaebe20707c2be7d7"
  const tokenAddress = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB" // Properly checksummed
  const orderRecipient = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717" // Properly checksummed

  // Get the Orders contract
  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(ordersAddress)

  // Parameters
  const asset = "lqd"
  const ticker = "lqd"
  const usdcAmount = 100
  const subscriptionId = 379

  console.log("\n📋 Calling buyAsset with parameters:")
  console.log("- asset:", asset)
  console.log("- ticker:", ticker)
  console.log("- token:", tokenAddress)
  console.log("- usdcAmount:", usdcAmount)
  console.log("- subscriptionId:", subscriptionId)
  console.log("- orderAddr:", orderRecipient)

  console.log(
    "\n🚨 IMPORTANT: Make sure to add this contract as consumer to subscription 379:"
  )
  console.log("   New consumer address:", ordersAddress)
  console.log("   Chainlink dashboard: https://functions.chain.link/")

  try {
    // First test gas estimation
    console.log("\n🔍 Testing gas estimation...")
    const gasEstimate = await orders.estimateGas.buyAsset(
      asset,
      ticker,
      tokenAddress,
      usdcAmount,
      subscriptionId,
      orderRecipient
    )
    console.log("✅ Gas estimation successful:", gasEstimate.toString())

    // Now execute the transaction
    console.log("\n🔄 Executing buyAsset transaction...")
    const tx = await orders.buyAsset(
      asset,
      ticker,
      tokenAddress,
      usdcAmount,
      subscriptionId,
      orderRecipient,
      {
        gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
      }
    )

    console.log("✅ Transaction sent! Hash:", tx.hash)
    console.log("⏳ Waiting for confirmation...")

    const receipt = await tx.wait()

    if (receipt.status === 1) {
      console.log("🎉 Transaction successful!")
      console.log("📦 Block number:", receipt.blockNumber)
      console.log("⛽ Gas used:", receipt.gasUsed.toString())

      // Check for events
      if (receipt.events && receipt.events.length > 0) {
        console.log("\n📋 Events emitted:")
        receipt.events.forEach((event, index) => {
          console.log(`${index + 1}. ${event.event || "Unknown Event"}`)
          if (event.args) {
            console.log("   Args:", event.args)
          }
        })
      }

      console.log(
        "\n🔗 View on BaseScan:",
        `https://sepolia.basescan.org/tx/${tx.hash}`
      )
    } else {
      console.log("❌ Transaction failed!")
    }
  } catch (error: any) {
    console.log("❌ Error calling buyAsset:", error)

    if (
      error.message.includes("consumer not registered") ||
      error.message.includes("InvalidConsumer")
    ) {
      console.log("\n🚨 CONSUMER NOT REGISTERED!")
      console.log("📝 Add this contract as consumer to subscription 379:")
      console.log("   - Go to https://functions.chain.link/")
      console.log("   - Connect wallet")
      console.log("   - Select Base Sepolia")
      console.log("   - Find subscription 379")
      console.log("   - Add consumer:", ordersAddress)
    }

    if (error.data) {
      console.log("Error data:", error.data)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
