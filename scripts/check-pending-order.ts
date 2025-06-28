import { ethers } from "hardhat"

async function main() {
  const ordersAddress = "0xF160191ce959CB26595c8E6eAEbe20707c2bE7D7"
  const requestId =
    "0x2515bdf4aa8b94f566aeedbb90eef88a9b719f0ad5bcf743e32aa677d0b1fa6f"

  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(ordersAddress)

  console.log("🔍 Checking pending order status...")

  try {
    const pending = await orders.pendingBuyOrders(requestId)
    console.log("✅ Pending Order Found:")
    console.log("- User:", pending.user)
    console.log("- Ticker:", pending.ticker)
    console.log("- Token:", pending.token)
    console.log("- USDC Amount:", pending.usdcAmount.toString())
    console.log("- Order Address:", pending.orderAddr)
  } catch (error: any) {
    console.log("❌ No pending order found or error:", error.message)
  }
}

main().catch(console.error)
