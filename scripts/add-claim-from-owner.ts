import { ethers } from "hardhat"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address (owner)

  console.log("🔍 Adding claim from OnchainID owner...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`Owner Address: ${userAddress}`)

  // Get the signer for the user address
  const [deployer] = await ethers.getSigners()
  console.log(`Script runner: ${deployer.address}`)

  // Get the OnchainID contract instance
  const onchainId = await ethers.getContractAt("Identity", onchainIdAddress)

  try {
    // First, let's verify the user's permissions
    const userKeyId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["address"], [userAddress])
    )
    console.log(`\n🔑 User's key ID: ${userKeyId}`)

    const hasPurpose1 = await onchainId.keyHasPurpose(userKeyId, 1)
    const hasPurpose3 = await onchainId.keyHasPurpose(userKeyId, 3)

    console.log(`👤 User permissions:`)
    console.log(`   Purpose 1 (MANAGEMENT): ${hasPurpose1}`)
    console.log(`   Purpose 3 (CLAIM): ${hasPurpose3}`)

    if (!hasPurpose1 && !hasPurpose3) {
      console.log("❌ User doesn't have claim permissions. Cannot proceed.")
      return
    }

    // Prepare claim parameters
    const claimTopic = 1 // Topic 1 = KYC/Identity verification
    const claimScheme = 1 // Scheme 1 = ECDSA signature
    const issuer = userAddress // Self-attested claim (user is issuer)
    const claimData = ethers.utils.defaultAbiCoder.encode(
      ["string", "uint256"],
      ["KYC_VERIFIED", Math.floor(Date.now() / 1000)]
    )

    // Create a simple signature for the claim
    // Message format: keccak256(abi.encode(identityHolder_address, topic, data))
    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [onchainIdAddress, claimTopic, claimData]
      )
    )

    // If the script runner is not the user, we need to warn
    if (deployer.address.toLowerCase() !== userAddress.toLowerCase()) {
      console.log(
        `\n⚠️  Warning: Script runner (${deployer.address}) is not the OnchainID owner (${userAddress})`
      )
      console.log(
        `The transaction will be sent from ${deployer.address}, but it should be sent from ${userAddress}`
      )
      console.log(`This will likely fail due to permission checks.`)

      // For demo purposes, let's try anyway and show what would happen
      console.log(
        `\n📝 Attempting to call addClaim() anyway (will likely fail)...`
      )
    } else {
      console.log(`\n✅ Script runner matches OnchainID owner. Proceeding...`)
    }

    // Sign the message hash with the deployer's private key
    const signature = await deployer.signMessage(
      ethers.utils.arrayify(messageHash)
    )

    const claimUri = "https://spout.finance/claims/kyc"

    console.log(`\n📋 Claim parameters:`)
    console.log(`   Topic: ${claimTopic} (KYC)`)
    console.log(`   Scheme: ${claimScheme} (ECDSA)`)
    console.log(`   Issuer: ${issuer}`)
    console.log(`   Data: ${claimData}`)
    console.log(`   Signature: ${signature}`)
    console.log(`   URI: ${claimUri}`)

    // Add the claim
    console.log(`\n🚀 Calling addClaim()...`)

    const tx = await onchainId.addClaim(
      claimTopic,
      claimScheme,
      issuer,
      signature,
      claimData,
      claimUri
    )

    console.log(`⏳ Transaction sent: ${tx.hash}`)

    const receipt = await tx.wait()
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`)
    console.log(`💰 Gas used: ${receipt.gasUsed.toString()}`)

    // Check for events
    const claimAddedEvents = receipt.events?.filter(
      (e) => e.event === "ClaimAdded"
    )
    if (claimAddedEvents && claimAddedEvents.length > 0) {
      const event = claimAddedEvents[0]
      console.log(`\n🎉 Claim added successfully!`)
      console.log(`   Claim ID: ${event.args?.claimId}`)
      console.log(`   Topic: ${event.args?.topic}`)
      console.log(`   Issuer: ${event.args?.issuer}`)
    }

    // Verify the claim was added
    const claimId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [issuer, claimTopic]
      )
    )
    const claim = await onchainId.getClaim(claimId)

    console.log(`\n🔍 Claim verification:`)
    console.log(`   Claim ID: ${claimId}`)
    console.log(`   Topic: ${claim.topic}`)
    console.log(`   Scheme: ${claim.scheme}`)
    console.log(`   Issuer: ${claim.issuer}`)
    console.log(`   Data: ${claim.data}`)
    console.log(`   URI: ${claim.uri}`)
  } catch (error: any) {
    console.error("❌ Error adding claim:", error.message)

    if (error.message.includes("claim signer key")) {
      console.log(
        "\n💡 This error suggests the sender doesn't have purpose 3 permissions."
      )
      console.log("Make sure you're calling this from the correct address.")
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
