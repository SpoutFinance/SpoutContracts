import { run } from "hardhat"

async function main() {
  const contractAddress = "0x0070EA7A0CAD2Fb571DE4B90Cc1DdEA9268aDc0f"
  const contractName = "Orders"

  console.log(`Verifying ${contractName} contract at: ${contractAddress}`)
  console.log("Network: Base Sepolia")

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // Orders contract has no constructor arguments
      contract: "contracts/SpoutV1/Orders/Orders.sol:Orders",
    })

    console.log("✅ Contract verification successful!")
    console.log(
      `View on BaseScan: https://sepolia.basescan.org/address/${contractAddress}`
    )
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!")
      console.log(
        `View on BaseScan: https://sepolia.basescan.org/address/${contractAddress}`
      )
    } else {
      console.error("❌ Verification failed:", error.message)

      // Common troubleshooting tips
      console.log("\n🔧 Troubleshooting tips:")
      console.log("1. Make sure BASESCAN_API_KEY is set in hardhat.config.js")
      console.log("2. Wait a few minutes after deployment before verifying")
      console.log(
        "3. Check that the contract was compiled with the same Solidity version"
      )
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
