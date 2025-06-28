import { ethers } from "hardhat"

async function main() {
  console.log("🔍 Debugging buyAsset error for fixed Orders contract")

  const [deployer] = await ethers.getSigners()
  console.log("Debugging with account:", deployer.address)

  // Contract addresses
  const ordersAddress = "0xF160191ce959CB26595c8E6eAEbe20707c2bE7D7"
  const subscriptionId = 379

  // Get the Orders contract
  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(ordersAddress)

  console.log("\n📋 Contract Information:")
  console.log("- Orders address:", ordersAddress)
  console.log("- Subscription ID:", subscriptionId)

  // Check if contract is added as consumer
  console.log("\n🔍 Checking Chainlink Functions consumer status...")
  try {
    // Try to call the contract to see what error we get
    const asset = "lqd"
    const ticker = "lqd"
    const token = "0xB5F83286a6F8590B4d01eC67c885252ec5d0bdDB"
    const usdcAmount = 100
    const orderAddr = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"

    console.log("\n🧪 Testing buyAsset call...")

    // First try to estimate gas to get the revert reason
    try {
      await orders.estimateGas.buyAsset(
        asset,
        ticker,
        token,
        usdcAmount,
        subscriptionId,
        orderAddr
      )
      console.log("✅ Gas estimation successful - transaction should work")
    } catch (gasError: any) {
      console.log("❌ Gas estimation failed:")
      console.log("Error message:", gasError.message)

      // Try to decode the error data
      if (gasError.data) {
        console.log("Error data:", gasError.data)

        // Common Chainlink Functions errors
        if (gasError.data.includes("0x") && gasError.data.length > 10) {
          try {
            const decoded = ethers.utils.toUtf8String(gasError.data)
            console.log("Decoded error:", decoded)
          } catch (decodeError) {
            console.log("Could not decode error data as UTF8")
          }
        }
      }

      // Check if it's a consumer not registered error
      if (
        gasError.message.includes("consumer not registered") ||
        gasError.message.includes("consumer") ||
        gasError.message.includes("subscription")
      ) {
        console.log(
          "\n🚨 LIKELY CAUSE: Contract not added as consumer to subscription!"
        )
        console.log("📝 TO FIX:")
        console.log("1. Go to https://functions.chain.link/")
        console.log("2. Connect your wallet")
        console.log("3. Select Base Sepolia network")
        console.log("4. Find subscription ID 379")
        console.log("5. Add consumer address:", ordersAddress)
      }
    }

    // Also check transaction history for specific transaction
    console.log("\n🔍 Checking failed transaction details...")
    const provider = ethers.provider
    const txHash =
      "0x6b5fd04422cc5d2a446e6564d72808276425c9e73f6eaa9ede009ffa37df8e9f"

    try {
      const tx = await provider.getTransaction(txHash)
      const receipt = await provider.getTransactionReceipt(txHash)

      console.log(
        "Transaction status:",
        receipt.status === 1 ? "Success" : "Failed"
      )
      console.log("Gas used:", receipt.gasUsed.toString())
      console.log("Gas limit:", tx.gasLimit.toString())

      if (receipt.status === 0) {
        console.log("❌ Transaction reverted")

        // Try to get revert reason by replaying the transaction
        try {
          const callData = {
            to: tx.to,
            data: tx.data,
            from: tx.from,
          }
          await provider.call(callData, tx.blockNumber)
        } catch (replayError: any) {
          console.log("Revert reason:", replayError.message)

          if (replayError.data) {
            console.log("Revert data:", replayError.data)
          }
        }
      }
    } catch (txError) {
      console.log("Could not fetch transaction details:", txError)
    }
  } catch (error: any) {
    console.log("❌ Error occurred:", error.message)
  }

  console.log("\n📋 NEXT STEPS:")
  console.log("1. Add contract as consumer to subscription 379:")
  console.log("   - Contract address:", ordersAddress)
  console.log("   - Chainlink dashboard: https://functions.chain.link/")
  console.log("2. Wait for consumer registration to be confirmed")
  console.log("3. Retry the buyAsset transaction")
  console.log(
    "4. Optionally remove old consumer: 0x0070EA7A0CAD2Fb571DE4B90Cc1DdEA9268aDc0f"
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
