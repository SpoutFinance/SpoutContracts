const { ethers } = require("hardhat")
require("dotenv").config()

async function main() {
  // Your deployed contract addresses
  const trustedIssuersRegistryAddress =
    "0x760634e1dd6bDd20D5e4f728d9cEaB4E3E74814A"
  const claimTopicsRegistryAddress =
    "0x0F9619aBf14980787A10Be58D02421445BC59D68"
  const claimIssuerAddress = "0x3d3e0A0D7ee8af06630a041A2c0cEC9603d08720"

  const [deployer] = await ethers.getSigners()
  console.log("🔧 Setting up ClaimIssuer as trusted issuer...")
  console.log("📋 Deployer:", deployer.address)
  console.log("🏢 ClaimIssuer:", claimIssuerAddress)
  console.log("📜 TrustedIssuersRegistry:", trustedIssuersRegistryAddress)

  // Get contract instances
  const trustedIssuersRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry",
    trustedIssuersRegistryAddress
  )

  const claimTopicsRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry",
    claimTopicsRegistryAddress
  )

  try {
    // 1. First, ensure claim topic 1 (KYC) is added
    console.log("\n🔍 Step 1: Checking claim topics...")
    const claimTopics = await claimTopicsRegistry.getClaimTopics()
    console.log(
      "Current claim topics:",
      claimTopics.map((t) => t.toString())
    )

    const hasTopicOne = claimTopics.some((topic) => topic.toString() === "1")

    if (!hasTopicOne) {
      console.log("➕ Adding claim topic 1 (KYC)...")
      const addTopicTx = await claimTopicsRegistry.addClaimTopic(1)
      await addTopicTx.wait()
      console.log("✅ Claim topic 1 added!")
    } else {
      console.log("✅ Claim topic 1 already exists")
    }

    // 2. Check if ClaimIssuer is already a trusted issuer
    console.log("\n🔍 Step 2: Checking trusted issuers...")
    const trustedIssuers =
      await trustedIssuersRegistry.getTrustedIssuersForClaimTopic(1)
    console.log("Current trusted issuers for topic 1:", trustedIssuers)

    const isAlreadyTrusted = trustedIssuers.some(
      (issuer) => issuer.toLowerCase() === claimIssuerAddress.toLowerCase()
    )

    if (!isAlreadyTrusted) {
      console.log("➕ Adding ClaimIssuer as trusted issuer for topic 1...")

      // Get the ClaimIssuer contract interface
      const claimIssuerContract = await ethers.getContractAt(
        "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer",
        claimIssuerAddress
      )

      // Add ClaimIssuer to trusted issuers for claim topic 1
      const addIssuerTx = await trustedIssuersRegistry.addTrustedIssuer(
        claimIssuerContract.address,
        [1] // claim topics array - topic 1 for KYC
      )
      await addIssuerTx.wait()
      console.log("✅ ClaimIssuer added as trusted issuer!")
    } else {
      console.log("✅ ClaimIssuer is already a trusted issuer")
    }

    // 3. Final verification
    console.log("\n🔍 Step 3: Final verification...")
    const finalTrustedIssuers =
      await trustedIssuersRegistry.getTrustedIssuersForClaimTopic(1)
    console.log("Final trusted issuers for topic 1:", finalTrustedIssuers)

    // Check if the issuer has proper claim topics
    const issuerClaimTopics =
      await trustedIssuersRegistry.getTrustedIssuerClaimTopics(
        claimIssuerAddress
      )
    console.log(
      "ClaimIssuer's claim topics:",
      issuerClaimTopics.map((t) => t.toString())
    )

    // Check if ClaimIssuer is trusted for our specific topic
    const isTrustedForTopic = await trustedIssuersRegistry.isTrustedIssuer(
      claimIssuerAddress
    )
    console.log("Is ClaimIssuer trusted:", isTrustedForTopic)

    console.log("\n🎉 Setup complete!")
    console.log("📋 Next steps:")
    console.log("   1. Users can now get claims from your ClaimIssuer")
    console.log(
      "   2. Claims from this issuer will be recognized by your token"
    )
    console.log(
      "   3. Users with valid claims will pass IdentityRegistry verification"
    )

    console.log("\n📝 To issue a claim to a user:")
    console.log(`   1. ClaimIssuer (${claimIssuerAddress}) signs the claim`)
    console.log(
      "   2. User calls addClaim() on their OnchainID with the signature"
    )
    console.log("   3. Token will recognize the claim as valid")
  } catch (error) {
    console.error("❌ Error setting up trusted issuer:", error.message)

    if (error.message.includes("Ownable: caller is not the owner")) {
      console.log(
        "\n💡 This error means you need to be the owner of the TrustedIssuersRegistry"
      )
      console.log(
        "Make sure you're calling this script with the correct private key"
      )
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
