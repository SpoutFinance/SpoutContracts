// This script checks claim topics and trusted issuers for claim topic 1
const { ethers } = require("hardhat")

async function main() {
  // Replace with your deployed proxy addresses
  const claimTopicsRegistryAddress =
    "0x8Fe87BBBE15Bc661B912ad475BA4ABC412a27A2D" // SpoutClaimTopicsRegistryProxy
  const trustedIssuersRegistryAddress =
    "0x9d355e9fa281b860a77a42CFCbE273c03E2a3361" // SpoutTrustedIssuersRegistryProxy

  const [deployer] = await ethers.getSigners()
  // Replace with your trusted issuer's ONCHAINID contract address
  const issuerOnchainIdAddress = "0xA5C77b623BEB3bC0071fA568de99e15Ccc06C7cb"
  // Replace with the address you want to check as a key
  const addressToCheck = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"

  // Get the contract instance (read-only, so any signer/provider is fine)
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    issuerOnchainIdAddress,
    deployer
  )

  // Compute the key for the address
  const key = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [addressToCheck])
  )
  const purposes = await identity.getKeyPurposes(key)
  console.log(`Purposes for key ${key} (address ${addressToCheck}):`, purposes)

  // Get contract instances
  const claimTopicsRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry",
    claimTopicsRegistryAddress
  )
  const trustedIssuersRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry",
    trustedIssuersRegistryAddress
  )

  // 1. Check claim topics
  const claimTopics = await claimTopicsRegistry.getClaimTopics()
  console.log(
    "Claim topics in ClaimTopicsRegistry:",
    claimTopics.map((x) => x.toString())
  )

  // 2. Check trusted issuers for claim topic 1
  const trustedIssuers =
    await trustedIssuersRegistry.getTrustedIssuersForClaimTopic(1)
  console.log("Trusted issuers for claim topic 1:", trustedIssuers)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
