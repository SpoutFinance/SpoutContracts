import { ethers } from "hardhat"
import hre from "hardhat"
import fs from "fs"

async function main() {
  console.log("🚀 Deploying ReserveAutomationMinimal contract...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Configuration
  const reserveContractAddress = "0xf26c960Abf98875f87764502f64e8F5ef9134C20" // From BaseSepolia.json
  const subscriptionId = 379 // Your working Chainlink Functions subscription
  const updateInterval = 3600 // 1 hour for testing (instead of 24 hours)
  const ownerAddress = deployer.address

  console.log("📋 Deployment Configuration:")
  console.log("   Reserve Contract:", reserveContractAddress)
  console.log("   Subscription ID:", subscriptionId)
  console.log(
    "   Update Interval:",
    updateInterval,
    "seconds (",
    updateInterval / 60,
    "minutes)"
  )
  console.log("   Owner:", ownerAddress)

  // Deploy ReserveAutomationMinimal
  const ReserveAutomationMinimal = await ethers.getContractFactory(
    "ReserveAutomationMinimal"
  )
  const reserveAutomation = await ReserveAutomationMinimal.deploy(
    reserveContractAddress,
    subscriptionId,
    updateInterval,
    ownerAddress
  )

  await reserveAutomation.deployed()

  console.log("✅ ReserveAutomationMinimal deployed!")
  console.log("📍 Contract address:", reserveAutomation.address)

  // Update BaseSepolia.json
  const configPath = "./BaseSepolia.json"
  let config: any = {}

  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, "utf8")
    config = JSON.parse(configFile)
  }

  config["ReserveAutomationMinimal"] = {
    "Deployment owner": deployer.address,
    "Deployment address": reserveAutomation.address,
    "Contract Name": "ReserveAutomationMinimal",
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log("📝 Updated BaseSepolia.json")

  // Test the contract functions
  console.log("\n🧪 Testing Minimal Contract Functions:")

  try {
    const owner = await reserveAutomation.owner()
    console.log("✅ Owner:", owner)

    const reserveContract = await reserveAutomation.reserveContract()
    console.log("✅ Reserve Contract:", reserveContract)

    const subscriptionIdResult = await reserveAutomation.subscriptionId()
    console.log("✅ Subscription ID:", subscriptionIdResult.toString())

    const intervalResult = await reserveAutomation.updateInterval()
    console.log("✅ Update Interval:", intervalResult.toString(), "seconds")

    const lastUpdate = await reserveAutomation.lastUpdateTime()
    console.log(
      "✅ Last Update:",
      new Date(lastUpdate.toNumber() * 1000).toISOString()
    )

    // Calculate when next update will be
    const nextUpdate = lastUpdate.toNumber() + intervalResult.toNumber()
    console.log("✅ Next Update:", new Date(nextUpdate * 1000).toISOString())

    // Check upkeep status
    const upkeepResult = await reserveAutomation.checkUpkeep("0x")
    console.log("✅ Upkeep Needed:", upkeepResult.upkeepNeeded)

    if (upkeepResult.upkeepNeeded) {
      console.log("🟢 Ready for automation!")
    } else {
      const timeRemaining = nextUpdate - Math.floor(Date.now() / 1000)
      console.log("🟡 Time remaining:", Math.max(0, timeRemaining), "seconds")
    }
  } catch (error) {
    console.log("❌ Error testing functions:", error.message)
  }

  console.log("\n📋 Minimal Contract Analysis:")
  console.log("✅ Only essential functions included")
  console.log("✅ Gas-optimized design")
  console.log("✅ Immutable configuration (lower gas)")
  console.log("✅ Single purpose: time-based Reserve triggers")

  // Verification
  if (process.env.VERIFY_CONTRACTS === "true") {
    console.log("\n🔍 Waiting before verification...")
    await new Promise((resolve) => setTimeout(resolve, 30000)) // Wait 30 seconds

    try {
      await hre.run("verify:verify", {
        address: reserveAutomation.address,
        constructorArguments: [
          reserveContractAddress,
          subscriptionId,
          updateInterval,
          ownerAddress,
        ],
      })
      console.log("✅ Contract verified on BaseScan")
    } catch (error) {
      console.log("❌ Verification failed:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
