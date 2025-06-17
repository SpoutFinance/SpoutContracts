import { ethers } from "hardhat"

const main = async () => {
  const TREXFactory = await ethers.getContractFactory("TREXFactory")
  const trexFactory =
    await TREXFactory.deploy(/* implementation authority, idFactory, etc. */)
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
      /* Trusted issuers addresses */
      // Smart contract address that issues claims for the compliance Topics.
    ],
    issuerClaims: [
      /* Claims that issuers are allowed to emit, by index corresponding to the issuers indexes */
    ],
  }

  // Deploy the full suite of T-REX contracts using CREATE2 opcode
  // The _salt parameter ensures contracts are deployed at predetermined addresses
  await trexFactory.deployTREXSuite(
    "MyTokenDeployment1", // Salt string to generate unique addresses
    tokenDetails,
    claimDetails
  )
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
