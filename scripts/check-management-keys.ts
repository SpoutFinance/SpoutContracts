import { ethers } from "ethers"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address

  console.log("🔍 Investigating OnchainID management structure...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`User Address: ${userAddress}`)

  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.base.org"
  )

  const onchainIdAbi = [
    "function keyHasPurpose(bytes32 _key, uint256 _purpose) external view returns (bool)",
    "function getKeysByPurpose(uint256 _purpose) external view returns (bytes32[] keys)",
    "function getKey(bytes32 _key) external view returns (uint256[] purposes, uint256 keyType, bytes32 key)",
  ]

  const onchainId = new ethers.Contract(
    onchainIdAddress,
    onchainIdAbi,
    provider
  )

  try {
    // Get all management keys (purpose 1)
    console.log("\n📋 All MANAGEMENT keys (purpose 1):")
    const managementKeys = await onchainId.getKeysByPurpose(1)

    if (managementKeys.length === 0) {
      console.log("   ❌ No management keys found! This shouldn't happen.")
    } else {
      for (let i = 0; i < managementKeys.length; i++) {
        const key = managementKeys[i]
        console.log(`   ${i + 1}. ${key}`)

        // Try to reverse engineer what address this key represents
        // Keys are stored as keccak256(abi.encode(address))
        // We can check if it matches our user's hashed address
        const userKeyHash = ethers.utils.keccak256(
          ethers.utils.solidityPack(["address"], [userAddress])
        )

        if (key === userKeyHash) {
          console.log(`      ✅ This is the user's address: ${userAddress}`)
        } else {
          console.log(`      ❓ Unknown address (hashed)`)
        }

        // Get detailed key info
        try {
          const keyDetails = await onchainId.getKey(key)
          console.log(`      Purposes: [${keyDetails[0].join(", ")}]`)
          console.log(`      Key Type: ${keyDetails[1]}`)
        } catch (e) {
          console.log(`      Error getting key details: ${(e as any).message}`)
        }
      }
    }

    // Double-check our user's permissions
    const userKeyHash = ethers.utils.keccak256(
      ethers.utils.solidityPack(["address"], [userAddress])
    )
    console.log(`\n🔑 User's key hash: ${userKeyHash}`)

    const hasPurpose1 = await onchainId.keyHasPurpose(userKeyHash, 1)
    const hasPurpose3 = await onchainId.keyHasPurpose(userKeyHash, 3)

    console.log(`👤 User has purpose 1 (MANAGEMENT): ${hasPurpose1}`)
    console.log(`🎯 User has purpose 3 (CLAIM): ${hasPurpose3}`)

    if (!hasPurpose1) {
      console.log(
        "\n🤔 If user deployed this OnchainID, they should have purpose 1..."
      )
      console.log("Possible explanations:")
      console.log("1. User didn't deploy it directly (used factory/proxy)")
      console.log("2. Management key was transferred after deployment")
      console.log(
        "3. OnchainID was deployed with different initialManagementKey"
      )
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
