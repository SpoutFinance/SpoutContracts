import { ethers } from "hardhat"
import "dotenv/config"

async function main() {
  // Check required environment variables
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required")
  }
  if (!process.env.PRIVATE_KEY_CUSTOMER2) {
    throw new Error("PRIVATE_KEY_CUSTOMER2 environment variable is required")
  }

  // Customer details
  const recipientEOA = "0x8b29471B993DD9854FDd80b6243f76Fc4a03E6e7"
  const recipientOnchainID = "0xf5fF3Dc42fa5a6E3deb85cA1b9036B800462973c"
  const claimIssuerContract = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"
  const tokenAddress = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB"

  // Fixed claim parameters
  const TOPIC = 1
  const SCHEME = 1
  const CLAIM_DATA = "KYC passed"

  console.log("🎯 Adding ClaimIssuer-signed claim to customer's OnchainID")
  console.log("👤 Recipient EOA:", recipientEOA)
  console.log("🆔 Recipient OnchainID:", recipientOnchainID)
  console.log("🏢 ClaimIssuer contract:", claimIssuerContract)
  console.log("📊 Topic:", TOPIC)
  console.log("📝 Claim data:", CLAIM_DATA)

  // Step 0: Pre-checks
  console.log("\n=== STEP 0: PRE-CHECKS ===")
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    recipientOnchainID
  )

  // Check if customer has MANAGEMENT key
  const MANAGEMENT_KEY = 1
  const customerKeyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [recipientEOA])
  )
  const hasManagementKey = await identity.keyHasPurpose(
    customerKeyHash,
    MANAGEMENT_KEY
  )
  if (!hasManagementKey) {
    console.log("❌ Customer doesn't have MANAGEMENT key on their OnchainID")
    return
  }
  console.log("✅ Customer has MANAGEMENT key")

  // Check if claim already exists
  const claimId = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256"],
      [claimIssuerContract, TOPIC]
    )
  )
  try {
    const existingClaim = await identity.getClaim(claimId)
    if (existingClaim.topic.toString() === TOPIC.toString()) {
      console.log("⚠️  Claim already exists with this topic")
      return
    }
  } catch (error) {
    // Expected error if claim doesn't exist
    console.log("✅ No existing claim found")
  }

  // Step 1: ClaimIssuer signs the claim
  console.log("\n=== STEP 1: CLAIMISSUER SIGNATURE ===")
  const claimIssuerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.provider
  )
  console.log("✍️  ClaimIssuer signer:", claimIssuerWallet.address)

  // Convert claim data to bytes and hash (for _data parameter)
  const claimDataBytes = ethers.utils.toUtf8Bytes(CLAIM_DATA)
  const claimDataHash = ethers.utils.keccak256(claimDataBytes)
  console.log("📝 Claim data bytes:", ethers.utils.hexlify(claimDataBytes))
  console.log("🔒 Claim data hash (for _data):", claimDataHash)

  // ABI encode for signature (using hashed data)
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "bytes"],
    [recipientOnchainID, TOPIC, claimDataHash] // Use hash here to match validation
  )
  console.log("📦 Encoded data:", encoded)

  // Hash the encoded data
  const messageHash = ethers.utils.keccak256(encoded)
  console.log("🔐 Message hash:", messageHash)

  // Sign the hash
  const signature = await claimIssuerWallet.signMessage(
    ethers.utils.arrayify(messageHash)
  )
  console.log("✅ ClaimIssuer signature:", signature)

  // Verify signature
  const recoveredAddress = ethers.utils.verifyMessage(
    ethers.utils.arrayify(messageHash),
    signature
  )
  console.log("🔍 Recovered address:", recoveredAddress)
  console.log(
    "✅ Signature valid:",
    recoveredAddress.toLowerCase() === claimIssuerWallet.address.toLowerCase()
  )

  // Step 2: Verify ClaimIssuer can validate this signature
  console.log("\n=== STEP 2: CLAIMISSUER VALIDATION ===")
  const claimIssuer = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer",
    claimIssuerContract
  )

  const isValidSignature = await claimIssuer.isClaimValid(
    recipientOnchainID,
    TOPIC,
    signature,
    claimDataHash
  )
  console.log("🔍 ClaimIssuer validates signature:", isValidSignature)

  if (!isValidSignature) {
    console.log("❌ ClaimIssuer can't validate signature - stopping here")
    return
  }

  // Step 3: Customer adds the claim to their OnchainID
  console.log("\n=== STEP 3: CUSTOMER ADDS CLAIM ===")
  const customerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_CUSTOMER2,
    ethers.provider
  )
  console.log("👤 Customer wallet:", customerWallet.address)

  if (customerWallet.address.toLowerCase() !== recipientEOA.toLowerCase()) {
    console.log(
      "⚠️  Warning: Customer wallet doesn't match expected recipient EOA"
    )
    console.log("   Expected:", recipientEOA)
    console.log("   Actual:", customerWallet.address)
    return
  }

  const identityWithCustomer = identity.connect(customerWallet)

  try {
    console.log("🔄 Customer adding ClaimIssuer-signed claim...")

    // Estimate gas with buffer
    const gasEstimate = await identityWithCustomer.estimateGas.addClaim(
      TOPIC,
      SCHEME,
      claimIssuerContract,
      signature,
      claimDataHash, // Use hash for _data parameter
      ""
    )
    const gasLimit = Math.ceil(gasEstimate.toNumber() * 1.2) // Add 20% buffer

    const tx = await identityWithCustomer.addClaim(
      TOPIC,
      SCHEME,
      claimIssuerContract,
      signature,
      claimDataHash, // Use hash for _data parameter
      "",
      { gasLimit }
    )

    console.log("📡 Transaction hash:", tx.hash)
    console.log("⏳ Waiting for confirmation...")
    await tx.wait()
    console.log("✅ SUCCESS! Claim added to customer's OnchainID")

    // Verify the claim was added
    console.log("\n=== STEP 4: VERIFICATION ===")
    const claim = await identity.getClaim(claimId)
    console.log("📋 Added claim details:")
    console.log("   Topic:", claim.topic.toString())
    console.log("   Issuer:", claim.issuer)
    console.log("   Scheme:", claim.scheme.toString())
    console.log("   Data:", claim.data)

    // Final verification - check if this helps with compliance
    console.log("\n=== STEP 5: COMPLIANCE CHECK ===")
    const token = await ethers.getContractAt(
      "contracts/ERC3643/token/Token.sol:Token",
      tokenAddress
    )

    const identityRegistryAddress = await token.identityRegistry()
    const identityRegistry = await ethers.getContractAt(
      "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry",
      identityRegistryAddress
    )

    const isRegistered = await identityRegistry.contains(recipientEOA)
    console.log("📝 Customer registered in IdentityRegistry:", isRegistered)

    if (isRegistered) {
      const isVerified = await identityRegistry.isVerified(recipientEOA)
      console.log("🎉 Customer is verified:", isVerified)

      if (isVerified) {
        console.log("🚀 Customer can now receive tokens!")
      } else {
        console.log(
          "⚠️  Customer still not verified - may need additional claims"
        )
      }
    } else {
      console.log(
        "❌ Customer needs to be registered in IdentityRegistry first"
      )
      console.log("💡 Next step: Register customer using registerIdentity()")
    }
  } catch (error) {
    console.log("❌ Error adding claim:", error.message)

    if (error.message.includes("Permissions")) {
      console.log(
        "💡 Customer might not have permission to add claims to this OnchainID"
      )
    } else if (error.message.includes("nonce too low")) {
      console.log("💡 Transaction nonce issue - retry with higher nonce")
    } else if (error.message.includes("insufficient funds")) {
      console.log("💡 Customer needs more ETH for gas")
    } else if (error.message.includes("execution reverted")) {
      // Try to parse revert reason
      const reason = error.message.split("reason=")[1]?.split('"')[1]
      if (reason) {
        console.log("💡 Contract reverted with reason:", reason)
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
