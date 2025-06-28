import { run } from "hardhat"

async function main() {
  console.log("🔍 Verifying fixed Orders contract on BaseScan...")

  const contractAddress = "0xF160191ce959CB26595c8E6eAEbe20707c2bE7D7"
  const contractPath = "contracts/SpoutV1/Orders/Orders.sol:Orders"

  console.log("📋 Contract Details:")
  console.log("- Address:", contractAddress)
  console.log("- Contract Path:", contractPath)
  console.log("- Network: Base Sepolia")

  try {
    console.log("\n🚀 Starting verification...")

    await run("verify:verify", {
      address: contractAddress,
      contract: contractPath,
      constructorArguments: [], // Orders contract has no constructor arguments
    })

    console.log("✅ Contract verified successfully!")
    console.log(
      "🔗 View on BaseScan:",
      `https://sepolia.basescan.org/address/${contractAddress}#code`
    )
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✅ Contract is already verified!")
      console.log(
        "🔗 View on BaseScan:",
        `https://sepolia.basescan.org/address/${contractAddress}#code`
      )
    } else {
      console.error("❌ Verification failed:", error.message)

      // Provide troubleshooting tips
      console.log("\n🔧 Troubleshooting tips:")
      console.log("1. Make sure the contract is deployed correctly")
      console.log("2. Check that the contract path is exact:", contractPath)
      console.log("3. Verify constructor arguments match (none for Orders)")
      console.log("4. Wait a few minutes after deployment before verifying")
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
