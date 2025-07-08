const { ethers } = require("hardhat")

// User's OnchainID that needs the claim key added
const userOnchainID = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"

async function main() {
  console.log("🔧 Adding default signer as claim key to user's OnchainID...")

  // Get the default signer (this is who the script runs as)
  const [defaultSigner] = await ethers.getSigners()
  console.log("🔑 Default signer:", defaultSigner.address)
  console.log("🆔 User OnchainID:", userOnchainID)

  // Get the OnchainID contract instance
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    userOnchainID
  )

  // Calculate the key hash for the default signer
  const signerKeyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [defaultSigner.address])
  )

  console.log("🔑 Signer key hash:", signerKeyHash)

  // Check if default signer already has claim key
  const hasClaimKey = await identity.keyHasPurpose(signerKeyHash, 3)
  console.log("🔍 Default signer has claim key:", hasClaimKey)

  if (hasClaimKey) {
    console.log("✅ Default signer already has claim key - no action needed")
    return
  }

  // Check if we have permission to add keys (need management key)
  const hasManagementKey = await identity.keyHasPurpose(signerKeyHash, 1)
  console.log("🔍 Default signer has management key:", hasManagementKey)

  if (!hasManagementKey) {
    console.log(
      "❌ Default signer doesn't have management key - cannot add claim key"
    )
    console.log("💡 You need to run this script with the user's private key")
    return
  }

  try {
    console.log("🔄 Adding default signer as claim key...")

    // Add the default signer as a claim key (purpose 3, type 1)
    const addKeyTx = await identity.addKey(signerKeyHash, 3, 1)
    console.log("📡 Transaction hash:", addKeyTx.hash)

    console.log("⏳ Waiting for confirmation...")
    const receipt = await addKeyTx.wait()
    console.log(
      "✅ SUCCESS! Default signer added as claim key in block:",
      receipt.blockNumber
    )

    // Verify the key was added
    const nowHasClaimKey = await identity.keyHasPurpose(signerKeyHash, 3)
    console.log("🔍 Verification - signer now has claim key:", nowHasClaimKey)

    console.log("\n🎉 Frontend should now work!")
    console.log("💡 The frontend addClaim calls will now succeed")
  } catch (error) {
    console.log("❌ Failed to add claim key:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
