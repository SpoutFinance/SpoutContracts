import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deploying from:", deployer.address)

  // Set a gas price override to prevent "replacement fee too low" errors on Base Sepolia
  // The value is in Wei. 2 Gwei is a common, safe value.
  const feeData = await ethers.provider.getFeeData()
  const maxFeePerGas =
    feeData.maxFeePerGas ?? ethers.utils.parseUnits("5", "gwei")
  const maxPriorityFeePerGas =
    feeData.maxPriorityFeePerGas ?? ethers.utils.parseUnits("2", "gwei")

  const overrides = {
    maxFeePerGas: maxFeePerGas.add(ethers.utils.parseUnits("2", "gwei")),
    maxPriorityFeePerGas: maxPriorityFeePerGas.add(
      ethers.utils.parseUnits("1", "gwei")
    ),
  }

  console.log(
    `\nUsing dynamic fees → Max Fee Per Gas: ${ethers.utils.formatUnits(
      overrides.maxFeePerGas!,
      "gwei"
    )} Gwei | Priority Fee: ${ethers.utils.formatUnits(
      overrides.maxPriorityFeePerGas!,
      "gwei"
    )} Gwei`
  )
  // --- 1. DEPLOY LOGIC CONTRACTS (The "Blueprints") ---
  console.log("\nDeploying logic contract implementations...")

  const Token = await ethers.getContractFactory(
    "contracts/ERC3643/token/Token.sol:Token"
  )
  const tokenLogic = await Token.deploy(overrides)
  await tokenLogic.deployed()
  console.log("✅ Token logic deployed at:", tokenLogic.address)

  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  )
  const identityRegistryLogic = await IdentityRegistry.deploy(overrides)
  await identityRegistryLogic.deployed()
  console.log(
    "✅ IdentityRegistry logic deployed at:",
    identityRegistryLogic.address
  )

  const IdentityRegistryStorage = await ethers.getContractFactory(
    "contracts/ERC3643/registry/storage/IdentityRegistryStorage.sol:IdentityRegistryStorage"
  )
  const identityRegistryStorageLogic = await IdentityRegistryStorage.deploy(
    overrides
  )
  await identityRegistryStorageLogic.deployed()
  console.log(
    "✅ IdentityRegistryStorage logic deployed at:",
    identityRegistryStorageLogic.address
  )

  const ClaimTopicsRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry"
  )
  const claimTopicsRegistryLogic = await ClaimTopicsRegistry.deploy(overrides)
  await claimTopicsRegistryLogic.deployed()
  console.log(
    "✅ ClaimTopicsRegistry logic deployed at:",
    claimTopicsRegistryLogic.address
  )

  const TrustedIssuersRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry"
  )
  const trustedIssuersRegistryLogic = await TrustedIssuersRegistry.deploy(
    overrides
  )
  await trustedIssuersRegistryLogic.deployed()
  console.log(
    "✅ TrustedIssuersRegistry logic deployed at:",
    trustedIssuersRegistryLogic.address
  )

  // --- 2. DEPLOY & CONFIGURE THE IMPLEMENTATION AUTHORITY ---
  console.log("\nDeploying and configuring the TREXImplementationAuthority...")

  const TREXImplementationAuthority = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/authority/TREXImplementationAuthority.sol:TREXImplementationAuthority"
  )
  const trexIA = await TREXImplementationAuthority.deploy(
    true, // referenceStatus: this is the main IA
    ethers.constants.AddressZero, // trexFactory: placeholder, will be set later
    ethers.constants.AddressZero // iaFactory: placeholder for now
  )
  await trexIA.deployed()
  console.log("✅ TREXImplementationAuthority deployed at:", trexIA.address)

  // --- 3. REGISTER LOGIC CONTRACTS AS A VERSION IN THE IA ---
  const version = { major: 1, minor: 0, patch: 0 }
  const contracts = {
    tokenImplementation: tokenLogic.address,
    ctrImplementation: claimTopicsRegistryLogic.address,
    irImplementation: identityRegistryLogic.address,
    irsImplementation: identityRegistryStorageLogic.address,
    tirImplementation: trustedIssuersRegistryLogic.address,
  }

  console.log("\nRegistering implementations as Version 1.0.0...")
  const tx = await trexIA.addAndUseTREXVersion(version, contracts, overrides)
  await tx.wait() // Wait for the transaction to be mined

  console.log(
    "✅ All logic contracts registered in TREXImplementationAuthority."
  )
  console.log("\n🚀 T-REX Infrastructure deployment complete!")
  console.log(
    "You can now use the TREXImplementationAuthority address to deploy your factories."
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  })
