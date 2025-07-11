import { ethers } from "hardhat"
import hre from "hardhat"
import fs from "fs"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("🔐 Deploying ConfidentialOrders contract with Inco Lightning")
  console.log("Deploying with account:", deployer.address)
  console.log(
    "Account balance:",
    ethers.utils.formatEther(await deployer.getBalance()),
    "ETH"
  )

  console.log("\n🔧 Features:")
  console.log("✅ Encrypted USDC amounts with euint256")
  console.log("✅ Encrypted asset amounts with euint256")
  console.log("✅ Encrypted arithmetic operations")
  console.log("✅ Permission management for encrypted data")
  console.log("✅ Inco Lightning integration")

  // Constructor parameters
  const owner = deployer.address
  const agent = deployer.address // Agent is also the deployer for now
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" // Base Sepolia USDC

  console.log("\n📝 Constructor parameters:")
  console.log("Owner:", owner)
  console.log("Agent:", agent)
  console.log("USDC Token:", usdcAddress)

  try {
    const ConfidentialOrders = await ethers.getContractFactory(
      "ConfidentialOrders"
    )
    console.log("✅ Contract factory created")

    const confidentialOrders = await ConfidentialOrders.deploy(
      owner,
      agent,
      usdcAddress
    )
    console.log("📡 Deploying contract...")

    await confidentialOrders.deployed()

    console.log(
      "\n✅ ConfidentialOrders contract deployed at:",
      confidentialOrders.address
    )
    console.log("✅ Deployer is the owner of the contract")

    // Update BaseSepolia.json
    const configPath = "./BaseSepolia.json"
    let config: any = {}

    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, "utf8")
      config = JSON.parse(configFile)
    }

    config["ConfidentialOrders"] = {
      "Deployment owner": deployer.address,
      "Deployment address": confidentialOrders.address,
      "Contract Name": "ConfidentialOrders",
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log("📝 Updated BaseSepolia.json")

    // Create ABI file
    const abiPath = "./abi/confidentialOrders.json"
    const abiData = {
      address: confidentialOrders.address,
      abi: ConfidentialOrders.interface.format(ethers.utils.FormatTypes.json),
    }

    fs.writeFileSync(abiPath, JSON.stringify(abiData, null, 2))
    console.log("📝 Created abi/confidentialOrders.json")

    // Verify deployment
    try {
      const owner = await confidentialOrders.owner()
      console.log("✅ Contract owner:", owner)

      const agent = await confidentialOrders.agent()
      console.log("✅ Contract agent:", agent)

      const usdc = await confidentialOrders.usdcToken()
      console.log("✅ USDC token:", usdc)

      console.log("✅ Deployment verification successful!")
    } catch (error) {
      console.log("⚠️  Could not verify contract immediately (this is normal)")
      console.log("Error:", error.message)
    }

    console.log("\n🔧 Next Steps:")
    console.log(
      "1. Add contract to Chainlink Functions subscription as consumer:"
    )
    console.log("   Address:", confidentialOrders.address)
    console.log("2. Fund the contract with LINK tokens for oracle requests")
    console.log("3. Test encrypted buyAsset and sellAsset functions")
    console.log("4. Set up proper permissions for encrypted data access")

    // Verification on Etherscan
    if (process.env.VERIFY_CONTRACTS === "true") {
      console.log("\n🔍 Waiting before verification...")
      await new Promise((resolve) => setTimeout(resolve, 30000)) // Wait 30 seconds

      try {
        await hre.run("verify:verify", {
          address: confidentialOrders.address,
          constructorArguments: [owner, agent, usdcAddress],
        })
        console.log("✅ Contract verified on BaseScan")
      } catch (error) {
        console.log("❌ Verification failed:", error.message)
        console.log("💡 You can verify manually later using:")
        console.log(
          `npx hardhat verify --network base-sepolia ${confidentialOrders.address} "${owner}" "${agent}" "${usdcAddress}"`
        )
      }
    }
  } catch (error) {
    console.error("❌ Deployment failed:", error)

    if (error.message.includes("@inco/lightning")) {
      console.log("\n💡 Inco Lightning dependency issue detected.")
      console.log("📦 Try installing the dependency:")
      console.log("npm install @inco/lightning")
      console.log(
        "\n🔧 Or check if Inco Lightning is available on Base Sepolia"
      )
      console.log(
        "🌐 Inco Lightning might only be available on specific networks"
      )
    }

    throw error
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
