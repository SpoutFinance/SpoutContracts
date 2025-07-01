const { ethers } = require("hardhat")

async function main() {
  const onchainIdAddress = "0xf5fF3Dc42fa5a6E3deb85cA1b9036B800462973c"

  console.log("🔍 Checking claims on OnchainID...")
  console.log("🆔 OnchainID:", onchainIdAddress)

  try {
    const identity = await ethers.getContractAt(
      "contracts/Onchain-ID/contracts/Identity.sol:Identity",
      onchainIdAddress
    )

    console.log("\n📋 Checking claims across common topics...")

    // Check common claim topics (1-10 are typically used)
    const commonTopics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    let totalClaims = 0
    let foundClaims: any[] = []

    for (const topic of commonTopics) {
      try {
        const claimIds = await identity.getClaimIdsByTopic(topic)

        if (claimIds.length > 0) {
          console.log(`\n🎯 Topic ${topic}: Found ${claimIds.length} claim(s)`)
          totalClaims += claimIds.length

          for (let i = 0; i < claimIds.length; i++) {
            const claimId = claimIds[i]
            console.log(`\n   📄 Claim ${i + 1} (ID: ${claimId}):`)

            try {
              const claim = await identity.getClaim(claimId)
              const claimDetails = {
                topic: claim.topic.toString(),
                scheme: claim.scheme.toString(),
                issuer: claim.issuer,
                signature: claim.signature,
                data: claim.data,
                uri: claim.uri,
              }

              foundClaims.push({
                id: claimId,
                ...claimDetails,
              })

              console.log(`      Topic: ${claimDetails.topic}`)
              console.log(`      Scheme: ${claimDetails.scheme}`)
              console.log(`      Issuer: ${claimDetails.issuer}`)
              console.log(`      Signature: ${claimDetails.signature}`)
              console.log(`      Data: ${claimDetails.data}`)
              console.log(`      URI: ${claimDetails.uri}`)

              // Try to decode data if it looks like ABI encoded
              try {
                if (claimDetails.data && claimDetails.data !== "0x") {
                  console.log(`      Data (raw): ${claimDetails.data}`)

                  // Try common decoding patterns
                  try {
                    const decodedString = ethers.utils.defaultAbiCoder.decode(
                      ["string"],
                      claimDetails.data
                    )
                    console.log(`      Data (as string): ${decodedString[0]}`)
                  } catch {
                    try {
                      const decodedStringUint =
                        ethers.utils.defaultAbiCoder.decode(
                          ["string", "uint256"],
                          claimDetails.data
                        )
                      console.log(
                        `      Data (string, uint): ${decodedStringUint[0]}, ${decodedStringUint[1]}`
                      )
                    } catch {
                      console.log(`      Data: Cannot decode as common types`)
                    }
                  }
                }
              } catch (e) {
                console.log(`      Data decoding failed: ${(e as any).message}`)
              }
            } catch (e) {
              console.log(`      ❌ Error reading claim: ${(e as any).message}`)
            }
          }
        }
      } catch (error) {
        // Silently continue for topics that might not exist
      }
    }

    // Summary
    console.log(`\n📊 SUMMARY:`)
    console.log(`   Total claims found: ${totalClaims}`)

    if (totalClaims === 0) {
      console.log(`   ❌ No claims found on this OnchainID`)
      console.log(
        `   💡 This OnchainID either has no claims or uses non-standard topics`
      )
    } else {
      console.log(`   ✅ OnchainID has claims!`)

      // Group by topics
      const topicsSummary = foundClaims.reduce((acc, claim) => {
        acc[claim.topic] = (acc[claim.topic] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      console.log(`   📋 Claims by topic:`)
      Object.entries(topicsSummary).forEach(([topic, count]) => {
        const topicName = getTopicName(parseInt(topic))
        console.log(`      Topic ${topic} (${topicName}): ${count} claim(s)`)
      })

      // Show unique issuers
      const uniqueIssuers = [...new Set(foundClaims.map((c) => c.issuer))]
      console.log(`   👥 Unique issuers: ${uniqueIssuers.length}`)
      uniqueIssuers.forEach((issuer, i) => {
        console.log(`      ${i + 1}. ${issuer}`)
      })
    }

    // Additional checks
    console.log(`\n🔑 Additional OnchainID information:`)

    // Check management keys
    try {
      const managementKeys = await identity.getKeysByPurpose(1)
      console.log(`   Management keys (Purpose 1): ${managementKeys.length}`)
      managementKeys.forEach((key, i) => {
        console.log(`      ${i + 1}. ${key}`)
      })
    } catch (e) {
      console.log(`   ❌ Could not get management keys: ${(e as any).message}`)
    }

    // Check claim signer keys
    try {
      const claimKeys = await identity.getKeysByPurpose(3)
      console.log(`   Claim signer keys (Purpose 3): ${claimKeys.length}`)
      claimKeys.forEach((key, i) => {
        console.log(`      ${i + 1}. ${key}`)
      })
    } catch (e) {
      console.log(`   ❌ Could not get claim keys: ${(e as any).message}`)
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message)

    if (error.message.includes("call revert exception")) {
      console.log("\n💡 This might not be a valid OnchainID contract address")
      console.log("   - Check if the address is correct")
      console.log("   - Verify it's deployed on the current network")
      console.log("   - Ensure it implements the Identity interface")
    }
  }
}

function getTopicName(topic: number): string {
  const topicNames: Record<number, string> = {
    1: "KYC/Identity",
    2: "AML/Sanctions",
    3: "Residence",
    4: "Registry",
    5: "Qualification",
    6: "Jurisdiction",
    7: "Nationality",
    8: "Accreditation",
    9: "License",
    10: "Custom",
  }
  return topicNames[topic] || "Unknown"
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
