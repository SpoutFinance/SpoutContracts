import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                       PASTE YOUR ADDRESSES HERE
  // --------------------------------------------------------------------------------------------
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // The address from TREXProxy/07-deploy-trex-factory.ts
  const TREX_IA_ADDRESS = "0xBD456121D833e3d29Ef83c86f8dc57c97630878A" // The address from logic/04-deploy-implementation-authority.ts
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // The address from OnchainID/04-deploy-id-factory.ts
  const COMPLIANCE_LOGIC_ADDRESS = "0xCAdaFeDf40140C8eBCa3A0E802dfC4dD72869c9F"
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
  const IDFactory = await ethers.getContractFactory("IdFactory")
  const trexFactory = TREXFactory.attach(TREX_FACTORY_ADDRESS)
  const TREXia = await ethers.getContractFactory("TREXImplementationAuthority")

  const trexIA = TREXia.attach(TREX_IA_ADDRESS)
  const idFactory = IDFactory.attach(ID_FACTORY_ADDRESS)

  const owner = await trexFactory.owner()
  const idFactoryOwner = await idFactory.owner()
  console.log("Factory owner:", owner)
  console.log("ID Factory owner:", idFactoryOwner)
  console.log("deployer address:", deployer.address)

  // Check if the deployer is the owner of both contracts
  const isDeployerFactoryOwner =
    owner.toLowerCase() === deployer.address.toLowerCase()
  const isDeployerIdFactoryOwner =
    idFactoryOwner.toLowerCase() === deployer.address.toLowerCase()
  console.log(
    "Deployer is Factory owner:",
    isDeployerFactoryOwner ? "✅" : "❌"
  )
  console.log(
    "Deployer is ID Factory owner:",
    isDeployerIdFactoryOwner ? "✅" : "❌"
  )

  // Check if the factory is registered as a token factory in the IdFactory
  let isRegistered = false
  try {
    isRegistered = await idFactory.isTokenFactory(trexFactory.address)
  } catch (err) {
    console.error(
      "Error checking if factory is registered in IdFactory (isTokenFactory):",
      err
    )
  }
  console.log(
    "Factory registered in IdFactory (isTokenFactory):",
    isRegistered ? "✅" : "❌"
  )
  if (!isRegistered) {
    console.warn(
      "\n❌ The TREXFactory is NOT registered as a token factory in the IdFactory."
    )
    console.warn(
      "You must call idFactory.addTokenFactory(factoryAddress) as the IdFactory owner before deploying suites."
    )
  }

  // Print all implementation addresses from the Implementation Authority to check if Implementation Authority is completely set
  console.log("\nImplementation Authority completeness check:")
  console.log(
    "Token Implementation:         ",
    await trexIA.getTokenImplementation()
  )
  console.log(
    "ClaimTopicsRegistry Impl:     ",
    await trexIA.getCTRImplementation()
  )
  console.log(
    "IdentityRegistry Impl:        ",
    await trexIA.getIRImplementation()
  )
  console.log(
    "IdentityRegistryStorage Impl: ",
    await trexIA.getIRSImplementation()
  )
  console.log(
    "ModularCompliance Impl:       ",
    await trexIA.getMCImplementation()
  )
  console.log(
    "TrustedIssuersRegistry Impl:  ",
    await trexIA.getTIRImplementation()
  )

  // Print all deployment parameters
  const salt = "SpoutSUSCCorporateBondToken" // Change this to a new, random value if needed
  console.log("Salt:", salt)

  // Build the TokenDetails struct for the suite
  // See ITREXFactory.sol for the struct definition
  const tokenDetails: any = {
    // address of the owner of all contracts
    owner: deployer.address,
    // name of the token
    name: "Spout US Corporate Bond Token",
    // symbol / ticker of the token
    symbol: "SUSC",
    // decimals of the token (can be between 0 and 18)
    decimals: 6,
    // identity registry storage address
    // set it to ZERO address if you want to deploy a new storage
    // if an address is provided, please ensure that the factory is set as owner of the contract
    irs: "0x0000000000000000000000000000000000000000",
    // ONCHAINID of the token, useful when wanting to issue new tokens for different entities
    // solhint-disable-next-line var-name-mixedcase
    ONCHAINID: "0x0000000000000000000000000000000000000000",
    // list of agents of the identity registry (can be set to an AgentManager contract)
    irAgents: [deployer.address],
    // list of agents of the token
    tokenAgents: [deployer.address],
    // modules to bind to the compliance, indexes are corresponding to the settings callData indexes
    // if a module doesn't require settings, it can be added at the end of the array, at index > settings.length
    complianceModules: [],
    // settings calls for compliance modules
    complianceSettings: [],
  }

  // Claim Details for KYC/AML (FIXED claimTopics shape)
  const claimDetails = {
    claimTopics: [1], // KYC claim topic (should be uint256[])
    issuers: [deployer.address], // Trusted issuer (you)
    issuerClaims: [[1]], // Claims that the issuer can emit (uint256[][])
  }

  console.log("TokenDetails:", JSON.stringify(tokenDetails, null, 2))
  console.log("ClaimDetails:", JSON.stringify(claimDetails, null, 2))

  // Check for CREATE2 salt collision for token identity
  const tokenSalt = "Token" + salt
  let isTokenSaltTaken = false
  try {
    isTokenSaltTaken = await idFactory.isSaltTaken(tokenSalt)
  } catch (err) {
    console.error("Error checking if token salt is taken:", err)
  }
  console.log(
    `isSaltTaken('${tokenSalt}'):`,
    isTokenSaltTaken ? "❌ Already taken" : "✅ Available"
  )
  if (isTokenSaltTaken) {
    console.warn(
      `\n❌ The CREATE2 salt '${tokenSalt}' is already taken. Try a new, unique salt.`
    )
  }

  // Print bytecode at each logic contract address to confirm they are deployed and not proxies/empty
  const logicAddresses = [
    await trexIA.getTokenImplementation(),
    await trexIA.getCTRImplementation(),
    await trexIA.getIRImplementation(),
    await trexIA.getIRSImplementation(),
    await trexIA.getMCImplementation(),
    await trexIA.getTIRImplementation(),
  ]
  const logicNames = [
    "TokenImplementation",
    "ClaimTopicsRegistryImplementation",
    "IdentityRegistryImplementation",
    "IdentityRegistryStorageImplementation",
    "ModularComplianceImplementation",
    "TrustedIssuersRegistryImplementation",
  ]
  for (let i = 0; i < logicAddresses.length; i++) {
    const code = await ethers.provider.getCode(logicAddresses[i])
    console.log(
      `${logicNames[i]} at ${logicAddresses[i]} has bytecode length:`,
      code.length
    )
    if (code === "0x" || code.length < 10) {
      console.warn(
        `❌ Warning: No contract code found at ${logicAddresses[i]} (${logicNames[i]})!`
      )
    } else if (code.length < 1000) {
      console.warn(
        `⚠️  Warning: Bytecode at ${logicAddresses[i]} (${logicNames[i]}) is suspiciously short. Make sure this is not a proxy or an incomplete contract!`
      )
    }
  }

  console.log("Deploying Spout RWA Token Suite...")

  const tx = await trexFactory.deployTREXSuite(
    "SpoutSUSCCorporateBondToken", // Unique salt
    tokenDetails,
    claimDetails,
    overrides
  )

  const receipt = await tx.wait()

  // Find the TREXSuiteDeployed event in the logs
  const event = receipt.events?.find((e) => e.event === "TREXSuiteDeployed")
  if (event) {
    const [tokenProxy, irProxy, irsProxy, tirProxy, ctrProxy, mcProxy, salt] =
      event.args
    console.log("Token Proxy:                ", tokenProxy)
    console.log("Identity Registry Proxy:    ", irProxy)
    console.log("Identity Registry Storage:  ", irsProxy)
    console.log("Trusted Issuers Registry:   ", tirProxy)
    console.log("Claim Topics Registry:      ", ctrProxy)
    console.log("Modular Compliance Proxy:   ", mcProxy)
    console.log("Deployment Salt:            ", salt)
  } else {
    console.log(
      "Could not find TREXSuiteDeployed event in transaction receipt."
    )
  }

  console.log("\nNext steps:")
  console.log("1. Run 10-init-spout-token.ts to initialize and mint your token")
  console.log("2. Set up Chainlink Functions subscription for market data")
  console.log("3. Configure compliance rules if needed")
  console.log("4. Add additional agents and issuers")
  console.log("5. Test interest calculation and payment functions")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  })
