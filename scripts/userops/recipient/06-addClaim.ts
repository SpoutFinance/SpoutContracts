const { ethers } = require("hardhat")
require("dotenv").config()

async function main() {
  const customerPrivateKey = process.env.PRIVATE_KEY_CUSTOMER
  const recipientAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
  const recipientOnchainID = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B"
  const claimIssuer = "0x3d3e0A0D7ee8af06630a041A2c0cEC9603d08720"

  console.log("🔧 CORRECTED: ClaimIssuer signs, Customer adds claim")
  console.log("🎯 Recipient address:", recipientAddress)
  console.log("🆔 OnchainID address:", recipientOnchainID)
  console.log("🏢 ClaimIssuer:", claimIssuer)

  // Step 1: ClaimIssuer (deployer) signs the claim
  const [deployerSigner] = await ethers.getSigners()
  console.log("✍️  ClaimIssuer/deployer will sign:", deployerSigner.address)

  const topic = 1
  const claimData = ethers.utils.toUtf8Bytes("KYC passed")

  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "bytes"],
    [recipientOnchainID, topic, claimData]
  )
  const dataHash = ethers.utils.keccak256(encoded)
  const ethHash = ethers.utils.hashMessage(ethers.utils.arrayify(dataHash))

  // DEPLOYER signs the claim (not customer)
  const deployerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.provider
  )
  const signatureObj = deployerWallet._signingKey().signDigest(ethHash)
  const signature = ethers.utils.joinSignature(signatureObj)

  console.log("✅ ClaimIssuer signature generated:", signature)

  // Step 2: Customer wallet adds the claim
  const customerWallet = new ethers.Wallet(customerPrivateKey, ethers.provider)
  console.log("👤 Customer will add claim:", customerWallet.address)

  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    recipientOnchainID
  )

  const identityWithCustomer = identity.connect(customerWallet)

  // Step 3: Verify the signature will work
  const claimIssuerContract = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer",
    claimIssuer
  )

  const isValidSignature = await claimIssuerContract.isClaimValid(
    recipientOnchainID,
    topic,
    signature,
    ethers.utils.hexlify(claimData)
  )

  console.log("🔍 Signature validation by ClaimIssuer:", isValidSignature)

  if (!isValidSignature) {
    console.log("❌ Signature still not valid!")
    return
  }

  try {
    console.log("🔄 Customer adding ClaimIssuer-signed claim...")
    const tx = await identityWithCustomer.addClaim(
      topic,
      1, // scheme
      claimIssuer,
      signature,
      ethers.utils.hexlify(claimData),
      "", // uri
      {
        gasLimit: 500000,
      }
    )

    console.log("📡 Transaction hash:", tx.hash)
    await tx.wait()
    console.log("✅ SUCCESS! KYC claim added to customer's identity")

    // Verify the claim was added
    const claimId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [claimIssuer, topic]
      )
    )

    const claim = await identity.getClaim(claimId)
    console.log("📋 Added claim details:")
    console.log("   Topic:", claim.topic.toString())
    console.log("   Issuer:", claim.issuer)

    // Final verification with IdentityRegistry
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

    const isVerified = await identityRegistry.isVerified(recipientAddress)
    console.log("\n🏆 FINAL RESULT:")
    console.log("📋 IdentityRegistry verification status:", isVerified)

    if (isVerified) {
      console.log("🎉 CUSTOMER IS NOW VERIFIED FOR TOKEN MINTING!")
      console.log("💰 You can now mint tokens to:", recipientAddress)
    } else {
      console.log("⚠️  Still not verified - may need to check trusted issuers")
    }
  } catch (error) {
    console.log("❌ Error adding claim:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
