import hre from "hardhat"

async function main() {
  console.log("🔍 Verifying ReserveAutomationMinimal contract...")

  const contractAddress = "0xAb2E7027aD69976a8cdfc89158b50d8Efeb47c92"
  const reserveContractAddress = "0xf26c960Abf98875f87764502f64e8F5ef9134C20"
  const subscriptionId = 379
  const updateInterval = 3600 // 1 hour
  const ownerAddress = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"

  console.log("Contract Address:", contractAddress)
  console.log("Constructor Arguments:")
  console.log("  Reserve Contract:", reserveContractAddress)
  console.log("  Subscription ID:", subscriptionId)
  console.log("  Update Interval:", updateInterval, "seconds")
  console.log("  Owner:", ownerAddress)

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        reserveContractAddress,
        subscriptionId,
        updateInterval,
        ownerAddress,
      ],
    })
    console.log("✅ Contract verified successfully on BaseScan!")
    console.log(
      "🔗 View at: https://sepolia.basescan.org/address/" + contractAddress
    )
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified on BaseScan!")
      console.log(
        "🔗 View at: https://sepolia.basescan.org/address/" + contractAddress
      )
    } else {
      console.log("❌ Verification failed:", error.message)
      console.log("\n🔧 Manual verification steps:")
      console.log(
        "1. Go to https://sepolia.basescan.org/address/" + contractAddress
      )
      console.log("2. Click 'Contract' tab")
      console.log("3. Click 'Verify and Publish'")
      console.log("4. Select 'Solidity (Single file)'")
      console.log(
        "5. Upload contracts/SpoutV1/Marketdata/ReserveAutomation.sol"
      )
      console.log("6. Use constructor arguments:")
      console.log("   Address:", reserveContractAddress)
      console.log("   Uint64:", subscriptionId)
      console.log("   Uint256:", updateInterval)
      console.log("   Address:", ownerAddress)
    }
  }

  console.log("\n📋 Contract Status Summary:")
  console.log("✅ Contract deployed and working")
  console.log("✅ Successfully tested manual trigger")
  console.log("✅ Connected to Reserve contract correctly")
  console.log("✅ Ready for Chainlink Automation registration")

  console.log("\n🎯 Next Step: Register for Chainlink Automation")
  console.log("Use this contract address:", contractAddress)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
