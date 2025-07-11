import { ethers } from "hardhat"
import hre from "hardhat"
import fs from "fs"

async function main() {
  console.log("🤖 Deploying ReserveAutomation contract...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  // Configuration
  const reserveContractAddress = "0xf26c960Abf98875f87764502f64e8F5ef9134C20" // From BaseSepolia.json
  const subscriptionId = 379 // Your working Chainlink Functions subscription
  const updateInterval = 86400 // 24 hours (in seconds)
  const ownerAddress = deployer.address

  console.log("📋 Deployment Configuration:")
  console.log("   Reserve Contract:", reserveContractAddress)
  console.log("   Subscription ID:", subscriptionId)
  console.log(
    "   Update Interval:",
    updateInterval,
    "seconds (",
    updateInterval / 3600,
    "hours)"
  )
  console.log("   Owner:", ownerAddress)

  // Deploy ReserveAutomation
  const ReserveAutomation = await ethers.getContractFactory("ReserveAutomation")
  const reserveAutomation = await ReserveAutomation.deploy(
    reserveContractAddress,
    subscriptionId,
    updateInterval,
    ownerAddress
  )

  await reserveAutomation.deployed()

  console.log("✅ ReserveAutomation deployed!")
  console.log("📍 Contract address:", reserveAutomation.address)

  // Update BaseSepolia.json
  const configPath = "./BaseSepolia.json"
  let config: any = {}

  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, "utf8")
    config = JSON.parse(configFile)
  }

  config["ReserveAutomation"] = {
    "Deployment owner": deployer.address,
    "Deployment address": reserveAutomation.address,
    "Contract Name": "ReserveAutomation",
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log("📝 Updated BaseSepolia.json")

  // Test available functions
  try {
    console.log("\n🔍 Testing basic functions:")

    const interval = await reserveAutomation.updateInterval()
    console.log("   ✅ Update Interval:", interval.toString(), "seconds")

    const lastUpdate = await reserveAutomation.lastUpdateTime()
    console.log(
      "   ✅ Last Update:",
      new Date(lastUpdate.toNumber() * 1000).toISOString()
    )

    const reserveAddress = await reserveAutomation.reserveContract()
    console.log("   ✅ Reserve Contract:", reserveAddress)

    const subId = await reserveAutomation.subscriptionId()
    console.log("   ✅ Subscription ID:", subId.toString())

    // Test checkUpkeep
    const [upkeepNeeded, performData] = await reserveAutomation.checkUpkeep(
      "0x"
    )
    console.log("   ✅ checkUpkeep works!")
    console.log("   Upkeep Needed:", upkeepNeeded)
  } catch (error) {
    console.log("   ❌ Function test failed:", error.message)
  }

  console.log("\n📋 Next Steps:")
  console.log("1. Go to https://automation.chain.link/")
  console.log("2. Connect your wallet and switch to Base Sepolia")
  console.log("3. Click 'Register new Upkeep'")
  console.log("4. Choose 'Time-based'")
  console.log("5. Enter the contract address:", reserveAutomation.address)
  console.log("6. Select 'performUpkeep' function")
  console.log("7. Enter '0x' for the bytes parameter")
  console.log("8. Set interval to 24 hours (86400 seconds)")
  console.log("9. Fund the upkeep with LINK tokens")
  console.log("10. The automation will start running automatically!")

  console.log("\n⚙️  Available Functions:")
  console.log("- Manual trigger: triggerNow() (owner only)")
  console.log("- View interval: updateInterval()")
  console.log("- View last update: lastUpdateTime()")
  console.log("- Check upkeep: checkUpkeep('0x')")

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
