import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                       PASTE YOUR ADDRESSES HERE
  // --------------------------------------------------------------------------------------------
  const TREX_FACTORY_ADDRESS = "0xYourTREXFactoryAddress" // The address from script 07
  const MARKET_DATA_CONSUMER_ADDRESS = "0xYourMarketDataConsumerAddress" // The address from script 08
  // --------------------------------------------------------------------------------------------

  console.log("Deploying Spout RWA Token Suite...")
  const [deployer] = await ethers.getSigners()
  console.log("Deploying from:", deployer.address)

  const feeData = await ethers.provider.getFeeData()
  const maxFeePerGas =
    feeData.maxFeePerGas ?? ethers.utils.parseUnits("5", "gwei")
  const maxPriorityFeePerGas =
    feeData.maxPriorityFeePerGas ?? ethers.utils.parseUnits("2", "gwei")

  const overrides = {
    maxFeePerGas: maxFeePerGas.add(ethers.utils.parseUnits("5", "gwei")),
    maxPriorityFeePerGas: maxPriorityFeePerGas.add(
      ethers.utils.parseUnits("2", "gwei")
    ),
  }

  console.log(
    `\nUsing dynamic fees → Max Fee Per Gas: ${ethers.utils.formatUnits(
      overrides.maxFeePerGas!,
      "gwei"
    )} Gwei | Priority Fee: ${ethers.utils.formatUnits(
      overrides.maxPriorityFeePerGas!,
      "gwei"
    )} Gwei\n`
  )

  // Get the TREX Factory contract
  const TREXFactory = await ethers.getContractFactory("TREXFactory")
  const trexFactory = TREXFactory.attach(TREX_FACTORY_ADDRESS)

  // RWA Token Details
  const tokenDetails = {
    name: "Spout US Corporate Bond Token",
    symbol: "SUSC",
    decimals: 6, // Standard for bond tokens
    owner: deployer.address, // Owner of all contracts
    irAgents: [deployer.address], // Identity registry agents
    tokenAgents: [deployer.address], // Token agents
    complianceModules: [], // No compliance modules for now
    complianceSettings: [], // No compliance settings
    ONCHAINID: ethers.constants.AddressZero, // Will be created automatically
    irs: ethers.constants.AddressZero, // Deploy new storage
  }

  // Claim Details for KYC/AML
  const claimDetails = {
    claimTopics: [
      [1], // KYC claim topic
    ],
    issuers: [
      deployer.address, // Trusted issuer (you)
    ],
    issuerClaims: [
      [1], // Claims that the issuer can emit
    ],
  }

  console.log("Deploying Spout RWA Token Suite...")
  const tx = await trexFactory.deployTREXSuite(
    "SpoutUSCorporateBondTokenV1", // Unique salt
    tokenDetails,
    claimDetails,
    overrides
  )

  const receipt = await tx.wait()
  const suiteDeployedEvent = receipt.events?.find(
    (e) => e.event === "TREXSuiteDeployed"
  )

  if (suiteDeployedEvent && suiteDeployedEvent.args) {
    const tokenAddress = suiteDeployedEvent.args._token
    console.log("✅ Spout RWA Token Suite Deployed!")
    console.log("-----------------------------------------")
    console.log("Token Proxy:                ", tokenAddress)
    console.log("Identity Registry Proxy:    ", suiteDeployedEvent.args._ir)
    console.log("Identity Registry Storage:  ", suiteDeployedEvent.args._irs)
    console.log("Trusted Issuers Registry:   ", suiteDeployedEvent.args._tir)
    console.log("Claim Topics Registry:      ", suiteDeployedEvent.args._ctr)
    console.log("Modular Compliance Proxy:   ", suiteDeployedEvent.args._mc)
    console.log("-----------------------------------------")

    // Initialize the RWA token with bond parameters
    console.log("\nInitializing RWA token parameters...")
    const SpoutToken = await ethers.getContractFactory("Spoutv1")
    const spoutToken = SpoutToken.attach(tokenAddress)

    // Set bond parameters (example values)
    const maturityDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 year from now
    const couponRate = 500 // 5% annual coupon rate in basis points

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
    const mintTx = await spoutToken.mint(deployer.address, initialSupply, overrides)
    await mintTx.wait()

    console.log("✅ Initial supply minted:", ethers.utils.formatUnits(initialSupply, 6), "SUSC")

    console.log("\n🚀 Spout RWA Token deployment complete!")
    console.log("Next steps:")
    console.log("1. Set up Chainlink Functions subscription for market data")
    console.log("2. Configure compliance rules if needed")
    console.log("3. Add additional agents and issuers")
    console.log("4. Test interest calculation and payment functions")

  } else {
    console.error("❌ Error: TREXSuiteDeployed event not found.")
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  }) 