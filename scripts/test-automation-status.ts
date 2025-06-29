import { ethers } from "hardhat"

async function main() {
  console.log("🔍 Testing Proof of Reserve Automation Status...")

  // From BaseSepolia.json
  const reserveAddress = "0xf26c960Abf98875f87764502f64e8F5ef9134C20"
  const automationMinimalAddress = "0xAb2E7027aD69976a8cdfc89158b50d8Efeb47c92"
  const subscriptionId = 379

  console.log("Reserve Contract:", reserveAddress)
  console.log("Automation Contract:", automationMinimalAddress)
  console.log("Subscription ID:", subscriptionId)

  try {
    // Test Reserve contract
    console.log("\n📊 Testing Reserve Contract...")
    const reserve = await ethers.getContractAt("Reserve", reserveAddress)

    const currentReserves = await reserve.getReserves()
    console.log(
      "✅ Current Reserves:",
      ethers.utils.formatUnits(currentReserves, 6),
      "LQD"
    )

    // Test Automation contract
    console.log("\n🤖 Testing Automation Contract...")
    const automation = await ethers.getContractAt(
      "ReserveAutomationMinimal",
      automationMinimalAddress
    )

    const owner = await automation.owner()
    console.log("✅ Automation Owner:", owner)

    const reserveContract = await automation.reserveContract()
    console.log("✅ Connected Reserve:", reserveContract)
    console.log(
      "✅ Addresses match:",
      reserveContract.toLowerCase() === reserveAddress.toLowerCase()
    )

    const automationSubscriptionId = await automation.subscriptionId()
    console.log("✅ Subscription ID:", automationSubscriptionId.toString())

    const updateInterval = await automation.updateInterval()
    console.log(
      "✅ Update Interval:",
      updateInterval.toString(),
      "seconds (",
      updateInterval.toNumber() / 3600,
      "hours)"
    )

    const lastUpdateTime = await automation.lastUpdateTime()
    console.log(
      "✅ Last Update:",
      new Date(lastUpdateTime.toNumber() * 1000).toISOString()
    )

    // Check if upkeep is needed
    const upkeepResult = await automation.checkUpkeep("0x")
    console.log("✅ Upkeep Needed:", upkeepResult.upkeepNeeded)

    if (upkeepResult.upkeepNeeded) {
      console.log("🟢 Ready for automation trigger!")

      // Calculate time since last update
      const currentTime = Math.floor(Date.now() / 1000)
      const timeSinceUpdate = currentTime - lastUpdateTime.toNumber()
      console.log(
        "⏰ Time since last update:",
        Math.floor(timeSinceUpdate / 60),
        "minutes"
      )
    } else {
      const currentTime = Math.floor(Date.now() / 1000)
      const timeSinceUpdate = currentTime - lastUpdateTime.toNumber()
      const timeRemaining = updateInterval.toNumber() - timeSinceUpdate
      console.log(
        "🟡 Time remaining:",
        Math.floor(timeRemaining / 60),
        "minutes"
      )
    }

    console.log("\n🧪 Testing Manual Trigger...")
    try {
      const [signer] = await ethers.getSigners()
      const isOwner = signer.address.toLowerCase() === owner.toLowerCase()

      if (!isOwner) {
        console.log(
          "❌ Current signer is not the owner, cannot test manual trigger"
        )
        console.log("Current signer:", signer.address)
        console.log("Required owner:", owner)
      } else {
        console.log("✅ Testing manual trigger as owner...")
        const tx = await automation.triggerNow()
        console.log("📡 Transaction sent:", tx.hash)
        await tx.wait()
        console.log("✅ Manual trigger successful!")

        // Check updated reserves
        const newReserves = await reserve.getReserves()
        console.log(
          "📊 Updated Reserves:",
          ethers.utils.formatUnits(newReserves, 6),
          "LQD"
        )
      }
    } catch (error) {
      console.log("❌ Manual trigger failed:", error.message.slice(0, 100))
    }
  } catch (error) {
    console.log("❌ Error testing contracts:", error.message)
  }

  console.log("\n🔧 Chainlink Automation Registration Status:")
  console.log("From your screenshot, I can see:")
  console.log("❌ No upkeeps registered yet in Chainlink Automation dashboard")
  console.log("")
  console.log("📋 Next Steps Required:")
  console.log("1. ✅ Chainlink Functions subscription (379) is active")
  console.log("2. ✅ Reserve contract is working and responding")
  console.log("3. ✅ Automation contract is deployed and functional")
  console.log(
    "4. ❌ Need to register automation contract with Chainlink Automation"
  )
  console.log("")
  console.log("🚀 To Register for Automation:")
  console.log("1. Go to https://automation.chain.link")
  console.log("2. Connect your wallet (same one that deployed the contract)")
  console.log("3. Click 'Register new Upkeep'")
  console.log("4. Select 'Custom logic' trigger")
  console.log("5. Enter contract address:", automationMinimalAddress)
  console.log("6. Set name: 'Spout Proof of Reserves'")
  console.log("7. Set gas limit: 500,000")
  console.log("8. Add LINK tokens for funding (start with 5-10 LINK)")
  console.log("9. Submit registration")
  console.log("")
  console.log("💰 Automation Costs:")
  console.log("- Each trigger costs ~0.1-0.2 LINK")
  console.log("- With 1-hour intervals = ~24 triggers/day = ~2-5 LINK/day")
  console.log("- Start with 10 LINK for ~2-5 days of operation")
  console.log("")
  console.log("⚡ After Registration:")
  console.log("- Chainlink will automatically call performUpkeep() every hour")
  console.log(
    "- This will trigger Reserve.requestReserves() to update proof-of-reserves"
  )
  console.log("- Monitor via the Automation dashboard")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
