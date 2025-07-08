const { ethers } = require("hardhat")

// Exact addresses from your frontend
const userWalletAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
const userOnchainID = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"
const claimIssuerAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"

// Your working signature
const signature =
  "0x3733343b20ad7a0f14189491147650dea2b63cf470c0b140840a06364e8671667797916251cf20529efb6f282a926ea20d3bcdd6fd567c4987f517c38fa31da71c"

async function main() {
  console.log("🧪 Testing EXACT frontend call with proper wallet context...")
  console.log("👤 User wallet:", userWalletAddress)
  console.log("🆔 User OnchainID:", userOnchainID)
  console.log("🏢 ClaimIssuer:", claimIssuerAddress)

  // Get the default signer (from hardhat config)
  const [defaultSigner] = await ethers.getSigners()
  console.log("🔑 Default signer:", defaultSigner.address)

  // THIS IS THE KEY - Check if default signer is the same as user wallet
  if (defaultSigner.address.toLowerCase() !== userWalletAddress.toLowerCase()) {
    console.log("❌ PROBLEM FOUND!")
    console.log(
      `   Default signer (${defaultSigner.address}) != User wallet (${userWalletAddress})`
    )
    console.log("   This explains the permissions error!")
    console.log("")
    console.log("💡 The script is running as the wrong address!")
    console.log(
      "   When you call identity.addClaim(), it uses the default signer"
    )
    console.log(
      "   But the user wallet is the one with permissions on the OnchainID"
    )
    console.log("")
    console.log("🔧 SOLUTION OPTIONS:")
    console.log("   1. Update hardhat.config.js to use the user's private key")
    console.log(
      "   2. Or add the default signer as a claim key to the user's OnchainID"
    )
    console.log("   3. Or ensure the frontend wallet is properly connected")
    return
  }

  console.log("✅ Signer matches user wallet - continuing with test...")

  // Get contract instance
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    userOnchainID
  )

  // Use the correct claim data that works
  const topic = 1
  const claimData = ethers.utils.toUtf8Bytes("KYC passed")
  const claimDataHash = ethers.utils.keccak256(claimData)

  console.log("📝 Using claim data that passed validation:")
  console.log("   Claim data:", ethers.utils.hexlify(claimData))
  console.log("   Claim data hash:", claimDataHash)

  // Check permissions one more time
  const userKeyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [userWalletAddress])
  )

  const hasClaimKey = await identity.keyHasPurpose(userKeyHash, 3)
  console.log("🔑 User has claim key:", hasClaimKey)

  if (!hasClaimKey) {
    console.log("❌ User doesn't have claim key on their OnchainID")
    console.log("🔧 Adding user as claim signer...")

    try {
      const addKeyTx = await identity.addKey(userKeyHash, 3, 1)
      await addKeyTx.wait()
      console.log("✅ User added as claim signer")
    } catch (error) {
      console.log("❌ Failed to add user as claim signer:", error.message)
      return
    }
  }

  // Now try the addClaim call
  try {
    console.log("\n🔄 Attempting addClaim call...")

    // First simulate
    const result = await identity.callStatic.addClaim(
      topic,
      1, // scheme
      claimIssuerAddress,
      signature,
      claimDataHash,
      "" // uri
    )

    console.log("✅ Simulation successful! Result:", result)

    // Now do the real call
    console.log("🔄 Executing real addClaim transaction...")
    const tx = await identity.addClaim(
      topic,
      1, // scheme
      claimIssuerAddress,
      signature,
      claimDataHash,
      "" // uri
    )

    console.log("📡 Transaction hash:", tx.hash)
    console.log("⏳ Waiting for confirmation...")

    const receipt = await tx.wait()
    console.log(
      "✅ SUCCESS! Transaction confirmed in block:",
      receipt.blockNumber
    )
  } catch (error) {
    console.log("❌ addClaim failed:", error.message)

    if (error.message.includes("claim signer key")) {
      console.log("\n🔍 Still getting permissions error. Checking deeper...")

      // Check the modifier requirements in detail
      console.log("🔍 Checking onlyClaimKey modifier requirements:")
      console.log("   - msg.sender == address(this): false (external call)")
      console.log(
        "   - keyHasPurpose(keccak256(abi.encode(msg.sender)), 3): checking..."
      )

      const msgSenderKey = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address"],
          [defaultSigner.address]
        )
      )

      const msgSenderHasClaimKey = await identity.keyHasPurpose(msgSenderKey, 3)
      console.log(`   - Actual check result: ${msgSenderHasClaimKey}`)

      if (!msgSenderHasClaimKey) {
        console.log("❌ CONFIRMED: msg.sender doesn't have claim key")
        console.log(
          `   msg.sender (${defaultSigner.address}) needs claim key on OnchainID`
        )
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

export {}
