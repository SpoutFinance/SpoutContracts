import { ethers } from "hardhat"

async function main() {
  console.log("Deploying logic contracts for all Registries...")
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

  const IdentityRegistryStorage = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistryStorage.sol:IdentityRegistryStorage"
  )
  const identityRegistryStorageLogic = await IdentityRegistryStorage.deploy(
    overrides
  )
  await identityRegistryStorageLogic.deployed()
  console.log(
    "✅ IdentityRegistryStorage logic deployed at:",
    identityRegistryStorageLogic.address
  )

  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  )
  const identityRegistryLogic = await IdentityRegistry.deploy(overrides)
  await identityRegistryLogic.deployed()
  console.log(
    "✅ IdentityRegistry logic deployed at:",
    identityRegistryLogic.address
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

  console.log(
    "\nNOTE: Please copy these addresses for the final registration step."
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  })
