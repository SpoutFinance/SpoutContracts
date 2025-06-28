import { ethers } from "hardhat"

async function main() {
  console.log("🔍 Monitoring Chainlink Functions request fulfillment")

  const ordersAddress = "0xF160191ce959CB26595c8E6eAEbe20707c2bE7D7"
  const requestId =
    "0x2515bdf4aa8b94f566aeedbb90eef88a9b719f0ad5bcf743e32aa677d0b1fa6f"

  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(ordersAddress)

  console.log("📋 Request Details:")
  console.log("- Orders contract:", ordersAddress)
  console.log("- Request ID:", requestId)
  console.log(
    "- Transaction:",
    "https://sepolia.basescan.org/tx/0x6429ffb641b5215896cfb4c7fd77b6506a111794b5acdd20f276e168ee5d9d45"
  )

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
  console.log("💡 Tip: Check https://functions.chain.link/ for request status")

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
