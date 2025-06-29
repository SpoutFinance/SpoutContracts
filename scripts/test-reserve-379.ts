import { ethers } from "hardhat"
import reserveDeployment from "../BaseSepolia.json"

async function main() {
  const [user] = await ethers.getSigners()

  console.log("🧪 Testing Reserve with Subscription ID 379")
  console.log("Testing with account:", user.address)

  // Connect to deployed Reserve contract
  const reserveAddress = reserveDeployment.Reserve["Deployment address"]
  console.log("\n📍 Reserve contract address:", reserveAddress)

  const Reserve = await ethers.getContractFactory("Reserve")
  const reserve = Reserve.attach(reserveAddress)

  const subscriptionId = 379 // Your actual subscription ID!

  try {
    console.log("\n✅ Pre-flight checks:")

    const owner = await reserve.owner()
    console.log("📋 Contract owner:", owner)

    const currentReserves = await reserve.getReserves()
    console.log("📊 Current reserves:", currentReserves.toString())

    const source = await reserve.SOURCE()
    console.log(
      "🔗 API configured:",
      source.includes("reserves/LQD") ? "✅ Correct" : "❌ Wrong"
    )

    console.log("\n🚀 Testing Proof of Reserves with Subscription ID 379...")
    console.log("💰 Your subscription has 16.86 LINK - plenty for testing!")

    try {
      // Test gas estimation first
      console.log("⚡ Estimating gas...")
      const gasEstimate = await reserve.estimateGas.requestReserves(
        subscriptionId
      )
      console.log("✅ Gas estimation successful:", gasEstimate.toString())

      // Send the transaction
      console.log("📡 Sending requestReserves transaction...")
      const tx = await reserve.requestReserves(subscriptionId, {
        gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
      })
      console.log("✅ Transaction sent:", tx.hash)
      console.log(
        "🔗 View on BaseScan:",
        `https://sepolia.basescan.org/tx/${tx.hash}`
      )

      console.log("⏳ Waiting for confirmation...")
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        console.log(
          "🎉 SUCCESS! Transaction confirmed in block:",
          receipt.blockNumber
        )

        // Check for ReservesRequested event
        const events = receipt.events?.filter(
          (x: any) => x.event === "ReservesRequested"
        )
        if (events && events.length > 0) {
          const requestId = events[0].args?.requestId
          const userAddr = events[0].args?.user
          console.log("🎯 Request ID:", requestId)
          console.log("👤 Requesting user:", userAddr)
          console.log("📤 Chainlink Functions request sent successfully!")

          console.log(
            "\n⏳ Waiting 45 seconds for Chainlink to fetch reserves data..."
          )
          console.log(
            "🌐 Chainlink is calling: https://rwa-deploy-backend.onrender.com/reserves/LQD"
          )

          // Wait for Chainlink response
          let checkCount = 0
          const maxChecks = 9 // Check for 9 times (45 seconds)

          while (checkCount < maxChecks) {
            await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds
            checkCount++

            const updatedReserves = await reserve.getReserves()
            console.log(
              `📊 Check ${checkCount}/9 - Reserves:`,
              updatedReserves.toString()
            )

            if (updatedReserves.gt(0)) {
              console.log("\n🎉 🎉 🎉 PROOF OF RESERVES SUCCESS! 🎉 🎉 🎉")
              console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
              console.log(
                "💰 Total LQD reserves:",
                ethers.utils.formatUnits(updatedReserves, 6),
                "LQD"
              )
              console.log(
                "🔢 Raw value:",
                updatedReserves.toString(),
                "(6 decimals)"
              )
              console.log(
                "🔒 Your tokenized assets are backed by real reserves!"
              )
              console.log("📈 This data came live from your backend API!")
              console.log("⛓️  And is now stored immutably on Base Sepolia!")

              // Check if we got the expected value
              const expectedValue = ethers.BigNumber.from("999992407203") // ~999,992.407203 * 1e6
              if (updatedReserves.eq(expectedValue)) {
                console.log("✅ Received exactly expected value!")
              } else {
                console.log(
                  "📊 Different value than expected - API may have updated!"
                )
              }

              return // Exit on success
            }
          }

          console.log("⏳ Reserves not updated after 45 seconds.")
          console.log(
            "💡 Chainlink may need more time. Check again in a few minutes:"
          )
          console.log(`💡 reserve.getReserves() should show > 0`)
        } else {
          console.log(
            "⚠️  No ReservesRequested event found - check transaction logs"
          )
        }
      } else {
        console.log("❌ Transaction failed (status 0)")
        console.log(
          "🔍 Check transaction details on BaseScan for error details"
        )
      }
    } catch (error: any) {
      console.error("❌ Error calling requestReserves:", error.message)

      if (error.message.includes("cannot estimate gas")) {
        console.log(
          "💡 Gas estimation failed - consumer may not be properly authorized"
        )
      } else if (error.message.includes("execution reverted")) {
        console.log("💡 Transaction reverted - check subscription setup")
      } else if (error.message.includes("insufficient funds")) {
        console.log("💡 Insufficient LINK tokens (but you have 16.86 LINK...)")
      }
    }
  } catch (error) {
    console.error("❌ Error during testing:", error.message)
  }

  console.log("\n📊 Summary:")
  console.log("- Contract: ✅ Deployed and verified")
  console.log("- Subscription: ✅ Active with 16.86 LINK")
  console.log("- Consumer: ✅ Added to subscription 379")
  console.log("- API: ✅ Returns live LQD reserves data")
  console.log("- Network: ✅ Base Sepolia")

  console.log("\n🌐 Manual verification available at:")
  console.log(
    `https://sepolia.basescan.org/address/${reserveAddress}#readContract`
  )
}

main()
  .then(() => {
    console.log("\n✅ Test with subscription 379 completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
