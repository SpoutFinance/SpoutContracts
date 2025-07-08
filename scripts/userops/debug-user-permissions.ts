const { ethers } = require("hardhat")

// From your testclaim.ts and the error context
const userWalletAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
const userOnchainID = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"
const claimIssuerAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"

async function main() {
  console.log("🔍 Debugging user permissions on their OnchainID...")
  console.log("👤 User wallet address:", userWalletAddress)
  console.log("🆔 User OnchainID contract:", userOnchainID)
  console.log("🏢 ClaimIssuer address:", claimIssuerAddress)

  // Get the OnchainID contract instance
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    userOnchainID
  )

  // Calculate the key hash for the user's wallet address
  const userKeyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [userWalletAddress])
  )

  console.log("\n--- User Key Analysis ---")
  console.log("🔑 User key hash:", userKeyHash)

  // Check what purposes the user has on their own OnchainID
  try {
    const purposes = await identity.getKeyPurposes(userKeyHash)
    console.log(
      "📋 User's purposes on their OnchainID:",
      purposes.map((p) => p.toString())
    )

    const numericPurposes = purposes.map((p) => Number(p))

    // Check specific purposes
    const hasManagementKey = numericPurposes.includes(1)
    const hasActionKey = numericPurposes.includes(2)
    const hasClaimKey = numericPurposes.includes(3)
    const hasEncryptionKey = numericPurposes.includes(4)

    console.log("👑 Has MANAGEMENT key (purpose 1):", hasManagementKey)
    console.log("⚡ Has ACTION key (purpose 2):", hasActionKey)
    console.log("🔑 Has CLAIM key (purpose 3):", hasClaimKey)
    console.log("🔒 Has ENCRYPTION key (purpose 4):", hasEncryptionKey)

    // The error suggests user doesn't have claim signer key (purpose 3)
    if (!hasClaimKey) {
      console.log(
        "\n❌ PROBLEM FOUND: User doesn't have CLAIM key (purpose 3) on their OnchainID!"
      )
      console.log("💡 This is why they can't add claims to their own identity")
    }

    if (!hasManagementKey) {
      console.log(
        "\n⚠️  WARNING: User doesn't have MANAGEMENT key (purpose 1) on their OnchainID!"
      )
      console.log("💡 This means they can't manage their own identity")
    }
  } catch (error) {
    console.log("❌ Error getting user purposes:", error.message)
  }

  // Check who actually has management keys on this OnchainID
  console.log("\n--- Management Key Analysis ---")
  try {
    const managementKeys = await identity.getKeysByPurpose(1)
    console.log("🔑 Management keys on this OnchainID:", managementKeys)

    if (managementKeys.length > 0) {
      console.log("\n🔍 Checking who controls this OnchainID...")

      // Common addresses to check
      const candidateAddresses = [
        userWalletAddress,
        "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7", // Your deployer
        "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55", // Management address we found earlier
        claimIssuerAddress,
      ]

      for (let mgmtKey of managementKeys) {
        console.log(`\nManagement key: ${mgmtKey}`)

        let found = false
        for (let candidate of candidateAddresses) {
          const candidateHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [candidate])
          )

          if (candidateHash === mgmtKey) {
            console.log(`  ✅ This belongs to: ${candidate}`)
            if (candidate === userWalletAddress) {
              console.log("     👤 This is the USER's address")
            }
            found = true
            break
          }
        }

        if (!found) {
          console.log(`  ❓ Unknown management address`)
        }
      }
    }
  } catch (error) {
    console.log("❌ Error getting management keys:", error.message)
  }

  // Check claim keys specifically
  console.log("\n--- Claim Key Analysis ---")
  try {
    const claimKeys = await identity.getKeysByPurpose(3)
    console.log("🔑 Claim keys on this OnchainID:", claimKeys)

    if (claimKeys.length === 0) {
      console.log("❌ NO CLAIM KEYS FOUND! This explains the error.")
      console.log(
        "💡 Solution: Add the user as a claim signer on their OnchainID"
      )
    } else {
      console.log("\n🔍 Checking who has claim signing rights...")

      const candidateAddresses = [
        userWalletAddress,
        "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7",
        "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55",
        claimIssuerAddress,
      ]

      for (let claimKey of claimKeys) {
        console.log(`\nClaim key: ${claimKey}`)

        let found = false
        for (let candidate of candidateAddresses) {
          const candidateHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [candidate])
          )

          if (candidateHash === claimKey) {
            console.log(`  ✅ This belongs to: ${candidate}`)
            if (candidate === userWalletAddress) {
              console.log(
                "     👤 This is the USER's address - they CAN add claims"
              )
            }
            found = true
            break
          }
        }

        if (!found) {
          console.log(`  ❓ Unknown claim signer address`)
        }
      }
    }
  } catch (error) {
    console.log("❌ Error getting claim keys:", error.message)
  }

  // Summary and solution
  console.log("\n--- SUMMARY ---")
  const userKeyExists = await identity.keyHasPurpose(userKeyHash, 3)

  if (!userKeyExists) {
    console.log("❌ ISSUE: User cannot add claims to their own OnchainID")
    console.log(
      "🔧 SOLUTION: Add user as claim signer (purpose 3) to their OnchainID"
    )
    console.log("📝 Command needed: identity.addKey(userKeyHash, 3, 1)")
    console.log(
      "   - Must be called by someone with MANAGEMENT key (purpose 1)"
    )
  } else {
    console.log("✅ User has claim signing rights - issue might be elsewhere")
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
