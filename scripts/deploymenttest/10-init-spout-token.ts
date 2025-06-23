import { ethers } from "hardhat"

async function main() {
  // --- Paste the deployed token proxy address here ---
  const TOKEN_PROXY_ADDRESS = "0x..." // <-- Replace with actual deployed token proxy address
  const MARKET_DATA_CONSUMER_ADDRESS = "0x..." // <-- Replace with actual market data consumer address

  const [deployer] = await ethers.getSigners()

  // Gas overrides (recommended for Base Sepolia)
  const feeData = await ethers.provider.getFeeData()
  const overrides = {
    maxFeePerGas: feeData.maxFeePerGas?.add(
      ethers.utils.parseUnits("5", "gwei")
    ),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.add(
      ethers.utils.parseUnits("2", "gwei")
    ),
  }

  // Attach to the deployed token proxy
  const SpoutToken = await ethers.getContractFactory("Spoutv1")
  const spoutToken = SpoutToken.attach(TOKEN_PROXY_ADDRESS)

  // Set bond parameters (example values)
  const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // 1 year from now
  const couponRate = 500 // 5% annual coupon rate in basis points

  console.log("\nInitializing RWA token parameters...")
  const initTx = await spoutToken.initializeRWA(
    maturityDate,
    couponRate,
    MARKET_DATA_CONSUMER_ADDRESS,
    overrides
  )
  await initTx.wait()

  console.log("✅ RWA token initialized with:")
  console.log("   Maturity Date:", new Date(maturityDate * 1000).toISOString())
  console.log("   Coupon Rate: 5%")
  console.log("   Market Data Consumer:", MARKET_DATA_CONSUMER_ADDRESS)

  // Mint initial tokens to the owner
  console.log("\nMinting initial tokens...")
  const initialSupply = ethers.utils.parseUnits("1000000", 6) // 1M tokens with 6 decimals
  const mintTx = await spoutToken.mint(
    deployer.address,
    initialSupply,
    overrides
  )
  await mintTx.wait()

  console.log(
    "✅ Initial supply minted:",
    ethers.utils.formatUnits(initialSupply, 6),
    "SUSC"
  )

  console.log("\n🚀 Spout RWA Token initialization complete!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
