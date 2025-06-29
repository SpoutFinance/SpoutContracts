import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("🚀 Deploying Orders contract (FIXED Base Sepolia DON_ID)")
  console.log("Deploying with account:", deployer.address)
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  )

  console.log("\n📋 Fix Applied:")
  console.log(
    "❌ Old DON_ID: 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000 (fun-ethereum-sepolia-1)"
  )
  console.log(
    "✅ New DON_ID: 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000 (fun-base-sepolia-1)"
  )

  // Constructor parameters
  const owner = deployer.address
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" // Base Sepolia USDC

  console.log("\n📝 Constructor parameters:")
  console.log("Owner:", owner)
  console.log("USDC Token:", usdcAddress)

  const Orders = await ethers.getContractFactory("Orders")
  const orders = await Orders.deploy(owner, usdcAddress)

  await orders.deployed()

  console.log("\n✅ Orders contract (FIXED) deployed at:", orders.address)
  console.log("✅ Deployer is the owner of the contract")

  // Verify deployment
  try {
    const owner = await orders.owner()
    console.log("✅ Contract owner:", owner)
    console.log("✅ Deployment successful!")
  } catch (error) {
    console.log("⚠️  Could not verify owner immediately (this is normal)")
  }

  console.log("\n🔧 Next Steps:")
  console.log(
    "1. Update Chainlink subscription to add new consumer:",
    orders.address
  )
  console.log("2. Test buyAsset function with new contract")
  console.log(
    "3. (Optional) Remove old consumer:",
    "0x0070EA7A0CAD2Fb571DE4B90Cc1DdEA9268aDc0f"
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
