import { run } from "hardhat"

async function main() {
  const contractAddress = "0xDf62Cd8e1b78093Ce79BDdEFF6b6b18A0C351423"
  const contractName = "Orders"

  // Constructor arguments used during deployment
  const owner = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"
  const agent = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

  console.log(`Verifying ${contractName} contract at: ${contractAddress}`)
  console.log("Network: Base Sepolia")
  console.log("Constructor arguments:", [owner, agent, usdcAddress])

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [owner, agent, usdcAddress],
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
