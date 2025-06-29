import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("🧪 Testing automation with account:", deployer.address)

  // Connect to contracts
  const automationAddress = "0xE7173fb008c3FBff52B5B02b0D0c57f0C35fC59C"
  const reserveAddress = "0xf26c960Abf98875f87764502f64e8F5ef9134C20"

  const ReserveAutomation = await ethers.getContractFactory("ReserveAutomation")
  const automation = ReserveAutomation.attach(automationAddress)

  const Reserve = await ethers.getContractFactory("Reserve")
  const reserve = Reserve.attach(reserveAddress)

  console.log("\n📊 Current Automation State:")
  try {
    const lastUpdate = await automation.lastUpdateTime()
    const interval = await automation.updateInterval()
    const owner = await automation.owner()
    const currentTime = Math.floor(Date.now() / 1000)

    console.log("Contract Owner:", owner)
    console.log("Your Address:", deployer.address)
    console.log("Last Update:", new Date(lastUpdate * 1000).toISOString())
    console.log(
      "Update Interval:",
      interval.toString(),
      "seconds (",
      interval / 3600,
      "hours)"
    )
    console.log("Current Time:", new Date(currentTime * 1000).toISOString())
    console.log("Time Since Last:", currentTime - lastUpdate, "seconds")
    console.log("Ready for update?", currentTime - lastUpdate >= interval)

    // Test checkUpkeep
    console.log("\n🔍 Testing checkUpkeep:")
    const [upkeepNeeded, performData] = await automation.checkUpkeep("0x")
    console.log("Upkeep Needed:", upkeepNeeded)
    console.log("Perform Data:", performData)

    // Check current reserve data
    console.log("\n💰 Current Reserve Data:")
    const currentReserves = await reserve.totalReserves()
    console.log(
      "Total Reserves:",
      ethers.utils.formatUnits(currentReserves, 6),
      "LQD"
    )

    // Manual trigger test (if you're the owner)
    if (owner.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("\n🚀 You are the owner! Testing manual trigger...")
      try {
        const tx = await automation.triggerNow()
        console.log("Transaction submitted:", tx.hash)
        console.log("⏳ Waiting for confirmation...")

        const receipt = await tx.wait()
        console.log("✅ Manual trigger successful!")
        console.log("Block number:", receipt.blockNumber)
        console.log("Gas used:", receipt.gasUsed.toString())

        // Check if reserves updated
        console.log("\n⏳ Waiting a moment for reserves to update...")
        await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

        const newReserves = await reserve.totalReserves()
        console.log(
          "New Total Reserves:",
          ethers.utils.formatUnits(newReserves, 6),
          "LQD"
        )

        const newLastUpdate = await automation.lastUpdateTime()
        console.log(
          "New Last Update:",
          new Date(newLastUpdate * 1000).toISOString()
        )
      } catch (error) {
        console.log("❌ Manual trigger failed:", error.message)
      }
    } else {
      console.log("\n⚠️  You are not the owner, cannot test manual trigger")
      console.log("Owner address:", owner)
      console.log("Your address:", deployer.address)
    }
  } catch (error) {
    console.log("❌ Error reading contract state:", error.message)
    console.log("This might indicate a network or contract issue")
  }

  console.log("\n📈 Alternative Verification Methods:")
  console.log("1. Check BaseScan for recent transactions to your contracts")
  console.log("2. View automation dashboard at automation.chain.link")
  console.log("3. Monitor events: AutomationTriggered, ReservesUpdated")
  console.log("4. Check Functions dashboard for API call history")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
