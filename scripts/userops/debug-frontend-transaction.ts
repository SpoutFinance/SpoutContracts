const { ethers } = require("hardhat")

// From the transaction details in the screenshot
const fromAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717" // Transaction FROM
const toAddress = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A" // Transaction TO (OnchainID)
const failedTxHash =
  "0xd4c0227722167644dfd5307b2566b0b26a31bc085fcaba88e5666297927d89d"

async function main() {
  console.log("🔍 Debugging frontend transaction failure...")
  console.log("📡 Failed transaction hash:", failedTxHash)
  console.log("📤 From address:", fromAddress)
  console.log("📥 To address (OnchainID):", toAddress)

  // Get the OnchainID contract instance
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    toAddress
  )

  // Check if the FROM address has the required permissions on the TO address (OnchainID)
  const fromKeyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [fromAddress])
  )

  console.log("\n--- Permission Check ---")
  console.log("🔑 From address key hash:", fromKeyHash)

  try {
    // Check what purposes the FROM address has on this OnchainID
    const purposes = await identity.getKeyPurposes(fromKeyHash)
    console.log(
      "📋 From address purposes on this OnchainID:",
      purposes.map((p) => p.toString())
    )

    const numericPurposes = purposes.map((p) => Number(p))
    const hasManagementKey = numericPurposes.includes(1)
    const hasActionKey = numericPurposes.includes(2)
    const hasClaimKey = numericPurposes.includes(3)

    console.log("👑 Has MANAGEMENT key (purpose 1):", hasManagementKey)
    console.log("⚡ Has ACTION key (purpose 2):", hasActionKey)
    console.log("🔑 Has CLAIM key (purpose 3):", hasClaimKey)

    if (!hasClaimKey) {
      console.log("\n❌ PROBLEM FOUND!")
      console.log(
        `   Address ${fromAddress} does NOT have CLAIM key (purpose 3) on OnchainID ${toAddress}`
      )
      console.log(
        "   This is why addClaim() failed with 'Sender does not have claim signer key'"
      )
    } else {
      console.log("\n✅ Address has CLAIM key - issue might be elsewhere")
    }
  } catch (error) {
    console.log("❌ Error checking purposes:", error.message)
  }

  // Check who actually has claim keys on this OnchainID
  console.log("\n--- Claim Key Analysis ---")
  try {
    const claimKeys = await identity.getKeysByPurpose(3)
    console.log("🔑 All claim keys on this OnchainID:", claimKeys)

    if (claimKeys.length === 0) {
      console.log("❌ NO CLAIM KEYS found on this OnchainID!")
    } else {
      console.log("\n🔍 Checking who has claim signing rights...")

      // Check if any of the claim keys belong to our FROM address
      let fromAddressHasClaimKey = false

      for (let i = 0; i < claimKeys.length; i++) {
        const claimKey = claimKeys[i]
        console.log(`\nClaim key ${i + 1}: ${claimKey}`)

        if (claimKey === fromKeyHash) {
          console.log(`  ✅ This belongs to our FROM address: ${fromAddress}`)
          fromAddressHasClaimKey = true
        } else {
          // Try to identify who this key belongs to
          const candidateAddresses = [
            "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717",
            "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7",
            "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55",
            "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F",
          ]

          let found = false
          for (let candidate of candidateAddresses) {
            const candidateHash = ethers.utils.keccak256(
              ethers.utils.defaultAbiCoder.encode(["address"], [candidate])
            )

            if (candidateHash === claimKey) {
              console.log(`  ✅ This belongs to: ${candidate}`)
              found = true
              break
            }
          }

          if (!found) {
            console.log(`  ❓ Unknown address`)
          }
        }
      }

      if (!fromAddressHasClaimKey) {
        console.log(
          `\n❌ CONFIRMED: ${fromAddress} does NOT have claim key on this OnchainID`
        )
      }
    }
  } catch (error) {
    console.log("❌ Error getting claim keys:", error.message)
  }

  // Check management keys to see who can fix this
  console.log("\n--- Management Key Analysis ---")
  try {
    const managementKeys = await identity.getKeysByPurpose(1)
    console.log("🔑 Management keys on this OnchainID:", managementKeys)

    if (managementKeys.length > 0) {
      console.log("\n🔍 Who can add claim keys (has management rights):")

      const candidateAddresses = [
        fromAddress,
        "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7",
        "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55",
        "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F",
      ]

      for (let mgmtKey of managementKeys) {
        let found = false
        for (let candidate of candidateAddresses) {
          const candidateHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [candidate])
          )

          if (candidateHash === mgmtKey) {
            console.log(`  ✅ ${candidate} has management rights`)
            if (candidate === fromAddress) {
              console.log(
                "     👤 This is the same as FROM address - they can add themselves as claim key!"
              )
            }
            found = true
            break
          }
        }

        if (!found) {
          console.log(`  ❓ Unknown management address: ${mgmtKey}`)
        }
      }
    }
  } catch (error) {
    console.log("❌ Error getting management keys:", error.message)
  }

  // Solution
  console.log("\n--- SOLUTION ---")
  const fromAddressHasManagement = await identity.keyHasPurpose(fromKeyHash, 1)

  if (fromAddressHasManagement) {
    console.log("🔧 SOLUTION: Frontend user has management rights!")
    console.log("   They need to first add themselves as a claim signer:")
    console.log(`   identity.addKey(${fromKeyHash}, 3, 1)`)
    console.log("   Then they can call addClaim()")
  } else {
    console.log("❌ PROBLEM: Frontend user doesn't have management rights")
    console.log(
      "   Someone with management rights needs to add them as claim signer"
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
