import { ethers } from "hardhat"

async function main() {
  // --- Fill in these addresses ---
  const identityRegistryAddress = "0x296D988cd8193D5c67a71A68E9Bdf533f53f943E"
  const claimTopicsRegistryAddress =
    "0x0F9619aBf14980787A10Be58D02421445BC59D68" // <-- Replace with your ClaimTopicsRegistry address
  const trustedIssuersRegistryAddress =
    "0x760634e1dd6bDd20D5e4f728d9cEaB4E3E74814A" // <-- Replace with your TrustedIssuersRegistry address
  const recipientAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
  const issuerAddress = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7" // Your claim issuer address

  // 1. Check registration
  const IdentityRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry"
  )
  const identityRegistry = IdentityRegistry.attach(identityRegistryAddress)
  const onchainIdAddress = await identityRegistry.identity(recipientAddress)
  console.log("ONCHAINID for recipient:", onchainIdAddress)
  if (onchainIdAddress === ethers.constants.AddressZero) {
    console.log("❌ Recipient is NOT registered in the IdentityRegistry.")
    return
  } else {
    console.log("✅ Recipient is registered in the IdentityRegistry.")
  }

  // 2. Check required claim topics
  const ClaimTopicsRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/ClaimTopicsRegistry.sol:ClaimTopicsRegistry"
  )
  const claimTopicsRegistry = ClaimTopicsRegistry.attach(
    claimTopicsRegistryAddress
  )
  const topics = await claimTopicsRegistry.getClaimTopics()
  console.log("Required claim topics:", topics)
  if (topics.length === 0) {
    console.log("❌ No claim topics set. Verification will always fail.")
    return
  }

  // 3. Check trusted issuers for each topic
  const TrustedIssuersRegistry = await ethers.getContractFactory(
    "contracts/ERC3643/registry/implementation/TrustedIssuersRegistry.sol:TrustedIssuersRegistry"
  )
  const trustedIssuersRegistry = TrustedIssuersRegistry.attach(
    trustedIssuersRegistryAddress
  )
  for (const topic of topics) {
    const trustedIssuers =
      await trustedIssuersRegistry.getTrustedIssuersForClaimTopic(topic)
    console.log(`Trusted issuers for topic ${topic}:`, trustedIssuers)
    if (
      !trustedIssuers
        .map((addr) => addr.toLowerCase())
        .includes(issuerAddress.toLowerCase())
    ) {
      console.log(
        `❌ Issuer ${issuerAddress} is NOT a trusted issuer for topic ${topic}.`
      )
    } else {
      console.log(
        `✅ Issuer ${issuerAddress} is a trusted issuer for topic ${topic}.`
      )
    }
  }

  // 4. Check ONCHAINID claims for each topic
  const Identity = await ethers.getContractFactory(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity"
  )
  const onchainId = Identity.attach(onchainIdAddress)
  for (const topic of topics) {
    const claimId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [issuerAddress, topic]
      )
    )
    try {
      const claim = await onchainId.getClaim(claimId)
      if (claim && claim[0].toNumber() === topic) {
        console.log(
          `✅ ONCHAINID has a claim for topic ${topic} issued by ${issuerAddress}.`
        )
      } else {
        console.log(
          `❌ ONCHAINID does NOT have a valid claim for topic ${topic} issued by ${issuerAddress}.`
        )
      }
    } catch (e) {
      console.log(
        `❌ ONCHAINID does NOT have a claim for topic ${topic} issued by ${issuerAddress}.`
      )
    }
  }

  // 5. Check if recipient is verified
  const isVerified = await identityRegistry.isVerified(recipientAddress)
  console.log(
    `Recipient is ${
      isVerified ? "✅ VERIFIED" : "❌ NOT VERIFIED"
    } in the IdentityRegistry.`
  )
}

main().catch(console.error)
