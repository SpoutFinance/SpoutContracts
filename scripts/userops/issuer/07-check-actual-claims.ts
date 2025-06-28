const { ethers } = require("hardhat")
require("dotenv").config()

async function main() {
  const recipientAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
  const recipientOnchainID = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B"
  const claimIssuer = "0x3d3e0A0D7ee8af06630a041A2c0cEC9603d08720"

  console.log(
    "🔍 Checking what claims actually exist on customer's OnchainID..."
  )
  console.log("🆔 OnchainID:", recipientOnchainID)

  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    recipientOnchainID
  )

  try {
    // Try to get claims by different methods
    console.log("\n📋 Method 1: Try to get claim by our calculated ID...")

    const topic = 1
    const claimId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [claimIssuer, topic]
      )
    )

    console.log("🔑 Calculated claim ID:", claimId)

    try {
      const claim = await identity.getClaim(claimId)
      console.log("📄 Claim found:")
      console.log("   Topic:", claim.topic.toString())
      console.log("   Scheme:", claim.scheme.toString())
      console.log("   Issuer:", claim.issuer)
      console.log("   Signature:", claim.signature)
      console.log("   Data:", claim.data)
      console.log("   URI:", claim.uri)
    } catch (error) {
      console.log("❌ No claim found with this ID:", error.message)
    }

    // Method 2: Try to get claims by topic
    console.log("\n📋 Method 2: Get claims by topic...")
    try {
      const claimIds = await identity.getClaimIdsByTopic(topic)
      console.log("🔑 Claim IDs for topic", topic + ":", claimIds)

      for (let i = 0; i < claimIds.length; i++) {
        console.log(`\n📄 Claim ${i + 1} (ID: ${claimIds[i]}):`)
        try {
          const claim = await identity.getClaim(claimIds[i])
          console.log("   Topic:", claim.topic.toString())
          console.log("   Scheme:", claim.scheme.toString())
          console.log("   Issuer:", claim.issuer)
          console.log("   Signature:", claim.signature)
          console.log("   Data:", claim.data)
          console.log("   URI:", claim.uri)
        } catch (e) {
          console.log("   ❌ Error reading claim:", e.message)
        }
      }
    } catch (error) {
      console.log("❌ Could not get claims by topic:", error.message)
    }

    // Method 3: Check all claim IDs
    console.log("\n📋 Method 3: Try to get all claim keys...")
    try {
      // This might not exist on all implementations
      const allClaimIds = (await identity.getAllClaimIds?.()) || []
      console.log("🔑 All claim IDs:", allClaimIds)
    } catch (error) {
      console.log("⚠️  getAllClaimIds not available:", error.message)
    }
  } catch (error) {
    console.log("❌ Error checking claims:", error.message)
  }

  // Also check IdentityRegistry status
  console.log("\n📋 Checking IdentityRegistry...")
  const tokenAddress = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB"
  const token = await ethers.getContractAt(
    "contracts/ERC3643/token/Token.sol:Token",
    tokenAddress
  )

  const identityRegistryAddress = await token.identityRegistry()
  const identityRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry",
    identityRegistryAddress
  )

  const isRegistered = await identityRegistry.contains(recipientAddress)
  const isVerified = await identityRegistry.isVerified(recipientAddress)

  console.log("🏢 IdentityRegistry status:")
  console.log("   Registered:", isRegistered)
  console.log("   Verified:", isVerified)

  if (isRegistered && !isVerified) {
    console.log("💡 User is registered but not verified")
    console.log("💡 This usually means claims are missing or invalid")
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
