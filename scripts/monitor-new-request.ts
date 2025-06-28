import { ethers } from "hardhat"

async function main() {
  console.log(
    "🔍 Monitoring NEW Chainlink Functions request with updated API credentials"
  )

  const ordersAddress = "0x84B5C26Ac7150e75Ae9b4F156344e158cA921C4d"
  const requestId =
    "0x153ee6d97d50d5a883721605fc388874815355fed6ee460f7c9919fcdf33eba6"

  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(ordersAddress)

  console.log("📋 Request Details:")
  console.log("- Orders contract:", ordersAddress)
  console.log("- Request ID:", requestId)
  console.log(
    "- Transaction:",
    "https://sepolia.basescan.org/tx/0x4a658009bb170b4a3f9519cdbc596ff5ce596bd7fb49d4d599b8c59ac31d4589"
  )
  console.log("- Block:", "27682665")

  console.log("\n🔍 Checking request status...")

  // Check if there's a pending buy order for this request ID
  try {
    const pendingOrder = await orders.pendingBuyOrders(requestId)
    console.log("📦 Pending Order Found:")
    console.log("- User:", pendingOrder.user)
    console.log("- Ticker:", pendingOrder.ticker)
    console.log("- Token:", pendingOrder.token)
    console.log("- USDC Amount:", pendingOrder.usdcAmount.toString())
    console.log("- Order Address:", pendingOrder.orderAddr)
  } catch (error) {
    console.log("❌ No pending order found or error:", error.message)
  }

  console.log("\n⏳ Setting up event listener for fulfillment...")

  // Listen for BuyOrderCreated event (this fires when the request is fulfilled)
  const filter = orders.filters.BuyOrderCreated()

  console.log("🎧 Listening for BuyOrderCreated events...")
  console.log(
    "   (This will show when the Chainlink oracle fulfills the request)"
  )
  console.log("   Press Ctrl+C to stop monitoring\n")

  let eventFound = false

  // Set up event listener
  orders.on(
    filter,
    (user, ticker, token, usdcAmount, assetAmount, price, event) => {
      if (!eventFound) {
        eventFound = true
        console.log("🎉 BuyOrderCreated Event Received!")
        console.log("📋 Order Details:")
        console.log("- User:", user)
        console.log("- Ticker:", ticker)
        console.log("- Token:", token)
        console.log("- USDC Amount:", usdcAmount.toString())
        console.log("- Asset Amount:", assetAmount.toString())
        console.log("- Price:", price.toString())
        console.log(
          "- Transaction:",
          `https://sepolia.basescan.org/tx/${event.transactionHash}`
        )
        console.log(
          "\n✅ Request fulfilled successfully! The order has been created."
        )
        console.log("🎯 This means the updated API credentials are working!")
        process.exit(0)
      }
    }
  )

  // Also check recent events in case we missed it
  console.log("🔍 Checking recent events (last 100 blocks)...")
  const currentBlock = await ethers.provider.getBlockNumber()
  const events = await orders.queryFilter(
    filter,
    currentBlock - 100,
    currentBlock
  )

  if (events.length > 0) {
    console.log(`📋 Found ${events.length} recent BuyOrderCreated events:`)
    events.forEach((event, index) => {
      console.log(
        `${index + 1}. Block ${event.blockNumber}: ${event.transactionHash}`
      )
      if (event.args) {
        console.log(`   User: ${event.args.user}, Ticker: ${event.args.ticker}`)
      }
    })
  } else {
    console.log("📭 No recent BuyOrderCreated events found")
  }

  // Keep the script running to listen for events
  console.log("\n📡 Monitoring active... waiting for fulfillment event")
  console.log("💡 Check https://functions.chain.link/ for request status")
  console.log("🆕 This is testing the new API credentials!")

  // Keep script alive
  setInterval(() => {
    // Just keep alive, the event listener will handle the rest
  }, 10000)
}

main()
  .then(() => {
    // Script will exit when event is received
  })
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
