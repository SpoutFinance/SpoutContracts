import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("🚀 Deploying Reserve contract (Proof of Reserve)")
  console.log("Deploying with account:", deployer.address)
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  )

  // Constructor parameters
  const owner = deployer.address

  console.log("\n📝 Constructor parameters:")
  console.log("Owner:", owner)
  console.log(
    "Backend URL: https://rwa-deploy-backend.onrender.com (hardcoded)"
  )

  const Reserve = await ethers.getContractFactory("Reserve")
  const reserve = await Reserve.deploy(owner)

  await reserve.deployed()

  console.log("\n✅ Reserve contract deployed at:", reserve.address)
  console.log("✅ Deployer is the owner of the contract")

  // Verify deployment
  try {
    const contractOwner = await reserve.owner()
    console.log("✅ Contract owner:", contractOwner)
    console.log("✅ Deployment successful!")
  } catch (error) {
    console.log("⚠️  Could not verify deployment immediately (this is normal)")
  }

  console.log("\n🔧 Next Steps:")
  console.log(
    "1. Update Chainlink subscription to add new consumer:",
    reserve.address
  )
  console.log("2. Test requestReserves function")
  console.log("3. Verify contract on BaseScan")

  console.log("\n📊 Usage:")
  console.log("- Anyone calls: reserve.requestReserves(subscriptionId)")
  console.log("- Get reserves: reserve.getReserves()")
  console.log("- Backend API: https://rwa-deploy-backend.onrender.com")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
