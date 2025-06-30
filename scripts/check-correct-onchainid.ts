import { ethers } from "ethers"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address

  console.log("🔍 Checking OnchainID permissions...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`User Address: ${userAddress}`)

  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.base.org"
  )

  try {
    // Check chain ID
    const network = await provider.getNetwork()
    console.log(`📡 Network: Chain ID ${network.chainId} (Base Sepolia)`)

    // Check if OnchainID contract exists
    const code = await provider.getCode(onchainIdAddress)
    console.log(
      `\n📝 OnchainID contract code length: ${code.length} characters`
    )

    if (code === "0x") {
      console.log("❌ No contract found at OnchainID address!")
      return
    }

    console.log("✅ OnchainID contract exists!")

    // OnchainID ABI
    const onchainIdAbi = [
      "function keyHasPurpose(bytes32 _key, uint256 _purpose) external view returns (bool)",
      "function getKeysByPurpose(uint256 _purpose) external view returns (bytes32[] keys)",
      "function owner() external view returns (address)",
    ]

    const onchainId = new ethers.Contract(
      onchainIdAddress,
      onchainIdAbi,
      provider
    )

    // Try to get owner
    try {
      const owner = await onchainId.owner()
      console.log(`👤 OnchainID Owner: ${owner}`)

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        console.log("✅ User is the owner of this OnchainID")
      } else {
        console.log("⚠️ User is NOT the owner of this OnchainID")
      }
    } catch (e) {
      console.log("❌ Could not get owner - might be a proxy")
    }

    // Hash the user address to get the key identifier
    const keyId = ethers.utils.keccak256(
      ethers.utils.solidityPack(["address"], [userAddress])
    )
    console.log(`\n🔑 User Key ID (hashed address): ${keyId}`)

    // Check if user has purpose 1 (MANAGEMENT)
    try {
      const hasPurpose1 = await onchainId.keyHasPurpose(keyId, 1)
      console.log(`✅ Purpose 1 (MANAGEMENT): ${hasPurpose1}`)
    } catch (e) {
      console.log(`❌ Error checking purpose 1: ${(e as any).message}`)
    }

    // Check if user has purpose 3 (CLAIM)
    try {
      const hasPurpose3 = await onchainId.keyHasPurpose(keyId, 3)
      console.log(`🎯 Purpose 3 (CLAIM): ${hasPurpose3}`)

      if (hasPurpose3) {
        console.log("\n✅ User CAN add claims to this OnchainID")
      } else {
        console.log(
          "\n❌ User CANNOT add claims - needs to call addKey() first"
        )
        console.log("💡 User should call: identity.addKey(keyId, 3, 1)")
      }
    } catch (e) {
      console.log(`❌ Error checking purpose 3: ${(e as any).message}`)
    }

    // Get all keys with purpose 3
    try {
      console.log("\n📋 All CLAIM signers (purpose 3):")
      const claimKeys = await onchainId.getKeysByPurpose(3)
      if (claimKeys.length === 0) {
        console.log("   No claim signers found")
      } else {
        claimKeys.forEach((key: string, index: number) => {
          console.log(`   ${index + 1}. ${key}`)
        })
      }
    } catch (e) {
      console.log(`❌ Error getting purpose 3 keys: ${(e as any).message}`)
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
