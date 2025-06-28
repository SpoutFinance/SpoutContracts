import { ethers } from "hardhat"

async function main() {
  console.log(
    "🔍 Checking for BuyOrderCreated events from new Orders contract (AAPL request)"
  )

  const ordersAddress = "0x84B5C26Ac7150e75Ae9b4F156344e158cA921C4d"
  const requestId =
    "0xd6e2456c974cf4e10f57ecc970ba615e8fd581ad9a148ccd1ece386378c73ef9"
  const txHash =
    "0x119a730912a66264c40a24a1a82a4e1881962f81def988d0c46c5c07a4249ccb"

  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(ordersAddress)

  console.log("📋 Checking Details:")
  console.log("- Orders contract:", ordersAddress)
  console.log("- Request ID:", requestId)
  console.log("- Original tx:", txHash)

  // Check if pending order still exists
  console.log("\n🔍 Checking pending order status...")
  try {
    const pendingOrder = await orders.pendingBuyOrders(requestId)
    if (pendingOrder.user === "0x0000000000000000000000000000000000000000") {
      console.log(
        "✅ Pending order has been cleared - this means it was fulfilled!"
      )
    } else {
      console.log("⏳ Pending order still exists:")
      console.log("- User:", pendingOrder.user)
      console.log("- Ticker:", pendingOrder.ticker)
      console.log("- USDC Amount:", pendingOrder.usdcAmount.toString())
      console.log("- Order Address:", pendingOrder.orderAddr)
    }
  } catch (error) {
    console.log("❌ Error checking pending order:", error.message)
  }

  // Check for BuyOrderCreated events
  console.log("\n🔍 Searching for BuyOrderCreated events...")
  const filter = orders.filters.BuyOrderCreated()
  const currentBlock = await ethers.provider.getBlockNumber()

  // Search recent blocks (last 100 blocks due to provider limit)
  const events = await orders.queryFilter(
    filter,
    currentBlock - 100,
    currentBlock
  )

  if (events.length > 0) {
    console.log(`🎉 Found ${events.length} BuyOrderCreated events:`)
    events.forEach((event, index) => {
      console.log(`\n📋 Event ${index + 1}:`)
      console.log("- Block:", event.blockNumber)
      console.log("- Transaction:", event.transactionHash)
      if (event.args) {
        console.log("- User:", event.args.user)
        console.log("- Ticker:", event.args.ticker)
        console.log("- Token:", event.args.token)
        console.log("- USDC Amount:", event.args.usdcAmount.toString())
        console.log("- Asset Amount:", event.args.assetAmount.toString())
        console.log("- Price:", event.args.price.toString())
      }
    })
  } else {
    console.log("❌ No BuyOrderCreated events found")
  }

  // Check for Response events from the parent FunctionAssetConsumer
  console.log(
    "\n🔍 Checking for Response events (from FunctionAssetConsumer)..."
  )
  const responseFilter = orders.filters.Response()
  const responseEvents = await orders.queryFilter(
    responseFilter,
    currentBlock - 100,
    currentBlock
  )

  if (responseEvents.length > 0) {
    console.log(`📡 Found ${responseEvents.length} Response events:`)
    responseEvents.forEach((event, index) => {
      console.log(`\n📋 Response Event ${index + 1}:`)
      console.log("- Block:", event.blockNumber)
      console.log("- Transaction:", event.transactionHash)
      if (event.args) {
        console.log("- Request ID:", event.args.requestId)
        console.log("- Asset:", event.args.asset)
        console.log("- Price:", event.args.price.toString())
        console.log("- Response length:", event.args.response.length)
        console.log("- Error length:", event.args.error.length)

        // Check if this matches our request
        if (event.args.requestId === requestId) {
          console.log("🎯 This matches our request ID!")
          if (event.args.error.length > 2) {
            console.log("❌ Error in response:", event.args.error)
          }
        }
      }
    })
  } else {
    console.log("❌ No Response events found")
  }

  // Check the latest price for AAPL
  console.log("\n🔍 Checking stored price for AAPL...")
  try {
    const price = await orders.getPrice("AAPL")
    console.log("💰 Stored AAPL price:", price.toString())
    if (price.gt(0)) {
      console.log("✅ Price has been stored successfully")
    }
  } catch (error) {
    console.log("❌ Error getting price:", error.message)
  }

  console.log("\n📋 SUMMARY:")
  if (events.length > 0) {
    console.log("✅ BuyOrderCreated events found - Orders are working!")
  } else {
    console.log("❌ No BuyOrderCreated events found")
    console.log("🔧 TROUBLESHOOTING:")
    console.log("1. Check Chainlink Functions dashboard for request status")
    console.log("2. Verify API credentials are working")
    console.log("3. Check if there were any errors in Response events")
    console.log("4. Consider testing with a different asset symbol")
  }
}

main().catch(console.error)
