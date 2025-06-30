const { ethers } = require("hardhat")
require("dotenv").config()

async function main() {
  const customerPrivateKey = process.env.PRIVATE_KEY_CUSTOMER
  const recipientAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
  const recipientOnchainID = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B"

  console.log("🔑 Adding recipient as CLAIM signer key to their OnchainID")
  console.log("🎯 Recipient address:", recipientAddress)
  console.log("🆔 OnchainID address:", recipientOnchainID)

  // Customer wallet (owns the OnchainID)
  const customerWallet = new ethers.Wallet(customerPrivateKey, ethers.provider)
  console.log("👤 Customer wallet:", customerWallet.address)

  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    recipientOnchainID
  )

  const identityWithCustomer = identity.connect(customerWallet)

  // Generate key hash for the recipient address
  const keyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [recipientAddress])
  )

  console.log("🔑 Key hash for recipient:", keyHash)

  // Check if they already have claim signer key
  const hasPurpose3 = await identity.keyHasPurpose(keyHash, 3)
  console.log("🔍 Already has CLAIM signer key (purpose 3):", hasPurpose3)

  if (hasPurpose3) {
    console.log("✅ Recipient already has CLAIM signer key!")
    return
  }

  try {
    console.log("🔄 Adding CLAIM signer key (purpose 3)...")
    const tx = await identityWithCustomer.addKey(
      keyHash,
      3, // purpose: CLAIM signer
      1, // keyType: ECDSA
      {
        gasLimit: 200000,
      }
    )

    console.log("📡 Transaction hash:", tx.hash)
    await tx.wait()
    console.log("✅ SUCCESS! Recipient now has CLAIM signer key")

    // Verify the key was added
    const nowHasPurpose3 = await identity.keyHasPurpose(keyHash, 3)
    console.log("🔍 Verification - has CLAIM signer key:", nowHasPurpose3)

    if (nowHasPurpose3) {
      console.log("🎉 READY! Recipient can now call addClaim!")
    }
  } catch (error) {
    console.log("❌ Error adding claim signer key:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
