import { ethers } from "hardhat"

const main = async () => {
  // --- 1. SET UP THE SCRIPT ---
  const [deployer] = await ethers.getSigners()
  console.log("Using account to deploy token suite:", deployer.address)

  // Address of the TREXFactory you already deployed with script 07
  const TREX_FACTORY_ADDRESS = "0x..." // 👈 PASTE YOUR DEPLOYED TREXFactory ADDRESS HERE

  // Add gas overrides to prevent network errors
  const feeData = await ethers.provider.getFeeData()
  const overrides = {
    maxFeePerGas: feeData.maxFeePerGas?.add(
      ethers.utils.parseUnits("5", "gwei")
    ),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.add(
      ethers.utils.parseUnits("2", "gwei")
    ),
  }

  console.log("\nAttaching to existing TREXFactory at:", TREX_FACTORY_ADDRESS)
  const TREXFactory = await ethers.getContractFactory("TREXFactory")
  const trexFactory = TREXFactory.attach(TREX_FACTORY_ADDRESS)

  // --- 2. DEFINE YOUR TOKEN DETAILS ---
  const tokenDetails = {
    name: "Spout US Corporate Bond Token", // Name of the token
    symbol: "SUSC", // Symbol / ticker of the token
    decimals: 6, // Decimals of the token (can be between 0 and 18) - Using 6 for bond standard
    owner: "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7", // Address of the owner of all contracts - Owner who can mint/burn and set compliance settings
    irAgents: ["0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"], // List of agents of the identity registry (can be set to an AgentManager contract)
    tokenAgents: ["0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"], // List of agents of the token
    complianceModules: [], // Modules to bind to the compliance, indexes correspond to the settings callData indexes
    complianceSettings: [], // Settings calls for compliance modules
    ONCHAINID: "0x0000000000000000000000000000000000000000", // ONCHAINID of the token, useful when wanting to issue new tokens for different entities
    irs: "0x0000000000000000000000000000000000000000", // Identity registry storage address - set to ZERO address to deploy a new storage
  }

  const claimDetails = {
    claimTopics: [1], // Corrected from [[1]] to [1]
    issuers: ["0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"],
    issuerClaims: [[1]],
  }

  // --- 3. DEPLOY THE TOKEN SUITE ---
  console.log("\nDeploying a new T-REX token suite...")
  const tx = await trexFactory.deployTREXSuite(
    "SpoutUSCorporateBondToken", // Salt string to generate unique addresses
    tokenDetails,
    claimDetails,
    overrides // Add overrides to the transaction
  )

  // --- 4. PARSE THE RESULTS ---
  console.log("Transaction sent! Waiting for confirmation...")
  const receipt = await tx.wait()

  const suiteDeployedEvent = receipt.events?.find(
    (e) => e.event === "TREXSuiteDeployed"
  )

  if (suiteDeployedEvent && suiteDeployedEvent.args) {
    console.log("✅ T-REX Suite Deployed! Proxy addresses:")
    console.log("-----------------------------------------")
    console.log("Token Proxy:                ", suiteDeployedEvent.args._token)
    console.log("Identity Registry Proxy:    ", suiteDeployedEvent.args._ir)
    console.log("Identity Registry Storage:  ", suiteDeployedEvent.args._irs)
    console.log("Trusted Issuers Registry:   ", suiteDeployedEvent.args._tir)
    console.log("Claim Topics Registry:      ", suiteDeployedEvent.args._ctr)
    console.log("Modular Compliance Proxy:   ", suiteDeployedEvent.args._mc)
    console.log("Deployment Salt:            ", suiteDeployedEvent.args._salt)
    console.log("-----------------------------------------")
  } else {
    console.error("Error: TREXSuiteDeployed event not found.")
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
