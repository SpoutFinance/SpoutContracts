import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                       PASTE YOUR ADDRESSES HERE
  // --------------------------------------------------------------------------------------------
  const TREX_FACTORY_ADDRESS = "0x2Eac68d74c552E86b6EF6888b3E18817fAde1785" // The address from script 07
  const IA_FACTORY_ADDRESS = "0xBD456121D833e3d29Ef83c86f8dc57c97630878A" // The address from script 07
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536"
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
  const IAFactory = await ethers.getContractFactory(
    "TREXImplementationAuthority"
  )
  const iaFactory = IAFactory.attach(IA_FACTORY_ADDRESS)
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
    await iaFactory.getTokenImplementation()
  )
  console.log(
    "ClaimTopicsRegistry Impl:     ",
    await iaFactory.getCTRImplementation()
  )
  console.log(
    "IdentityRegistry Impl:        ",
    await iaFactory.getIRImplementation()
  )
  console.log(
    "IdentityRegistryStorage Impl: ",
    await iaFactory.getIRSImplementation()
  )
  console.log(
    "ModularCompliance Impl:       ",
    await iaFactory.getMCImplementation()
  )
  console.log(
    "TrustedIssuersRegistry Impl:  ",
    await iaFactory.getTIRImplementation()
  )

  // Print all deployment parameters
  const salt = "SpoutUSCorporateBondToken" // Change this to a new, random value if needed
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
    complianceModules: [COMPLIANCE_LOGIC_ADDRESS],
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

  // Check for zero addresses in tokenDetails and claimDetails
  function isZeroAddress(addr) {
    return addr === "0x0000000000000000000000000000000000000000"
  }
  if (
    isZeroAddress(tokenDetails.owner) ||
    tokenDetails.irAgents.some(isZeroAddress) ||
    tokenDetails.tokenAgents.some(isZeroAddress) ||
    claimDetails.issuers.some(isZeroAddress)
  ) {
    console.warn(
      "\n❌ Warning: One or more addresses in tokenDetails or claimDetails are zero addresses (except irs/ONCHAINID, which are allowed to be zero for new deployments). This may cause a revert."
    )
  }

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
    await iaFactory.getTokenImplementation(),
    await iaFactory.getCTRImplementation(),
    await iaFactory.getIRImplementation(),
    await iaFactory.getIRSImplementation(),
    await iaFactory.getMCImplementation(),
    await iaFactory.getTIRImplementation(),
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

  // Warn if complianceModules is empty
  if (tokenDetails.complianceModules.length === 0) {
    console.warn(
      "⚠️  Warning: complianceModules is empty. Some logic contracts may require at least one compliance module."
    )
  }

  console.log("Deploying Spout RWA Token Suite...")
  try {
    await trexFactory.callStatic.deployTREXSuite(
      "SpoutUSCorporateBondToken", // Unique salt
      tokenDetails,
      claimDetails,
      overrides
    )
    console.log("Call would succeed")
  } catch (e) {
    console.error("Call would revert:", e.error?.reason || e.reason || e)
  }

  const tx = await trexFactory.deployTREXSuite(
    "SpoutUSCorporateBondToken", // Unique salt
    tokenDetails,
    claimDetails,
    overrides
  )

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
    console.log("\nNext steps:")
    console.log(
      "1. Run 10-init-spout-token.ts to initialize and mint your token"
    )
    console.log("2. Set up Chainlink Functions subscription for market data")
    console.log("3. Configure compliance rules if needed")
    console.log("4. Add additional agents and issuers")
    console.log("5. Test interest calculation and payment functions")
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
