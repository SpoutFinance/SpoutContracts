import { ethers } from "hardhat"
import reserveDeployment from "../BaseSepolia.json"

async function main() {
  const [user] = await ethers.getSigners()

  console.log("🔍 Direct Reserve Contract Testing")
  console.log("User:", user.address)

  // Connect to the deployed Reserve contract
  const reserveAddress = reserveDeployment.Reserve["Deployment address"]
  console.log("📍 Reserve Contract:", reserveAddress)

  const Reserve = await ethers.getContractFactory("Reserve")
  const reserve = Reserve.attach(reserveAddress)

  try {
    console.log("\n📊 Reading current reserves...")

    // Call getReserves() - this is a read function (no gas cost)
    const currentReserves = await reserve.getReserves()
    console.log("💰 Current reserves:", currentReserves.toString())

    if (currentReserves.gt(0)) {
      const formattedReserves = ethers.utils.formatUnits(currentReserves, 6)
      console.log("💰 Formatted reserves:", formattedReserves, "LQD")
      console.log("✅ Reserve data is available!")
    } else {
      console.log("📭 No reserves data yet (call requestReserves first)")
    }

    console.log("\n🔧 Contract Information:")

    // Get owner
    const owner = await reserve.owner()
    console.log("👤 Owner:", owner)

    // Get source code (first 150 chars)
    const source = await reserve.SOURCE()
    console.log("🔗 API Endpoint:", source.substring(0, 150) + "...")

    console.log("\n🚀 Want to update reserves? Choose an option:")
    console.log("1. 📱 Use BaseScan Web Interface (Recommended)")
    console.log("2. 💻 Call via this script")

    console.log("\n📱 OPTION 1: BaseScan Web Interface")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log(
      "1. 🌐 Go to:",
      `https://sepolia.basescan.org/address/${reserveAddress}#writeContract`
    )
    console.log("2. 🔗 Connect your wallet (same as deployer)")
    console.log("3. 📝 Find 'requestReserves' function")
    console.log("4. 💡 Enter subscriptionId: 379")
    console.log("5. 📤 Click 'Write' and confirm transaction")
    console.log("6. ⏱️  Wait 30-60 seconds")
    console.log("7. 📊 Check 'Read Contract' tab -> 'getReserves'")

    console.log("\n💻 OPTION 2: Call via Script")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    // Simple prompt to ask if they want to call requestReserves
    const answer = await new Promise<string>((resolve) => {
      readline.question(
        "🤔 Do you want to call requestReserves(379) now? (y/n): ",
        resolve
      )
    })
    readline.close()

    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      console.log("\n📡 Calling requestReserves(379)...")

      try {
        const tx = await reserve.requestReserves(379)
        console.log("✅ Transaction sent:", tx.hash)
        console.log(
          "🔗 View on BaseScan:",
          `https://sepolia.basescan.org/tx/${tx.hash}`
        )

        console.log("⏳ Waiting for confirmation...")
        const receipt = await tx.wait()

        if (receipt.status === 1) {
          console.log("🎉 Transaction confirmed!")

          console.log("⏳ Waiting 30 seconds for Chainlink response...")
          await new Promise((resolve) => setTimeout(resolve, 30000))

          const updatedReserves = await reserve.getReserves()
          console.log("📊 Updated reserves:", updatedReserves.toString())

          if (updatedReserves.gt(0)) {
            console.log(
              "💰 Reserves:",
              ethers.utils.formatUnits(updatedReserves, 6),
              "LQD"
            )
            console.log("🎉 Success! Fresh reserves data retrieved!")
          } else {
            console.log("⏳ Still processing... check again in a few minutes")
          }
        } else {
          console.log("❌ Transaction failed")
        }
      } catch (error: any) {
        console.error("❌ Error:", error.message)
      }
    } else {
      console.log("👍 No problem! Use the BaseScan interface when ready.")
    }
  } catch (error: any) {
    console.error("❌ Error reading contract:", error.message)
  }

  console.log("\n📋 Quick Reference:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📊 Read Reserves: getReserves()")
  console.log("🔄 Update Reserves: requestReserves(379)")
  console.log("⏱️  Update Time: ~30-60 seconds")
  console.log("💰 Cost: ~0.1 LINK per update")
  console.log("🌐 Public Access: Anyone can read reserves")
  console.log("🔒 Update Access: Only subscription owner/consumers")
}

main()
  .then(() => {
    console.log("\n✅ Direct contract test completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
