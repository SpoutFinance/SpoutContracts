import { ethers } from "hardhat"

const main = async () => {
  const TREXFactory = await ethers.getContractFactory("TREXFactory")
  const trexFactory = await TREXFactory.deploy(
    "0xBD456121D833e3d29Ef83c86f8dc57c97630878A", // Implementation Authority smart contract address
    "0xA37b1f4D5a8876184D62b9097335A4f4555b7c5f" // ID Factory smart contract address
  )
  await trexFactory.deployed()

  // TokenDetails struct holds all the necessary details for deploying a new T-REX token and its associated contracts
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

  // ClaimDetails struct holds all the necessary details regarding the claims and claim issuers
  const claimDetails = {
    claimTopics: [
      /* Claim topics required */
      [1],
    ],
    issuers: [
      "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7",
      /* Trusted issuers addresses */
      // Smart contract address that issues claims for the compliance Topics.
    ],
    issuerClaims: [
      [1],
      /* Claims that issuers are allowed to emit, by index corresponding to the issuers indexes */
    ],
  }

  // Deploy the full suite of T-REX contracts using CREATE2 opcode
  // The _salt parameter ensures contracts are deployed at predetermined addresses
  const tx = await trexFactory.deployTREXSuite(
    "SpoutUSCorporateBondToken", // Salt string to generate unique addresses
    tokenDetails,
    claimDetails
  )

  // Wait for the transaction to be mined and get the receipt
  const receipt = await tx.wait()

  // Find the TREXSuiteDeployed event in the transaction receipt
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
