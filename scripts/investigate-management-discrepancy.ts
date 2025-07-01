import { ethers } from "hardhat"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address (deployer)

  console.log("🔍 Investigating management permissions discrepancy...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`User Address (Deployer): ${userAddress}`)

  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.base.org"
  )

  const onchainId = await ethers.getContractAt("Identity", onchainIdAddress)

  try {
    // Hash the user address correctly
    const userKeyId = ethers.utils.keccak256(
      ethers.utils.solidityPack(["address"], [userAddress])
    )
    console.log(`\n🔑 User's key ID: ${userKeyId}`)

    // Check user's permissions
    const hasPurpose1 = await onchainId.keyHasPurpose(userKeyId, 1)
    const hasPurpose3 = await onchainId.keyHasPurpose(userKeyId, 3)

    console.log(`\n👤 User permissions:`)
    console.log(`   Purpose 1 (MANAGEMENT): ${hasPurpose1}`)
    console.log(`   Purpose 3 (CLAIM): ${hasPurpose3}`)

    // Get all management keys
    console.log(`\n📋 All management keys (purpose 1):`)
    const managementKeys = await onchainId.getKeysByPurpose(1)

    for (let i = 0; i < managementKeys.length; i++) {
      const key = managementKeys[i]
      console.log(`   ${i + 1}. ${key}`)

      // Get key details
      const keyDetails = await onchainId.getKey(key)
      console.log(`      Purposes: [${keyDetails[0].join(", ")}]`)
      console.log(`      Key Type: ${keyDetails[1]}`)

      // Check if this matches our user
      if (key === userKeyId) {
        console.log(`      ✅ This IS the user's key!`)
      } else {
        console.log(`      ❓ This is NOT the user's key`)
      }
    }

    // Let's also check if there's an issue with the key hashing
    console.log(`\n🔍 Debugging key hashing methods:`)

    // Method 1: Current method (solidityPack)
    const method1 = ethers.utils.keccak256(
      ethers.utils.solidityPack(["address"], [userAddress])
    )
    console.log(`Method 1 (solidityPack): ${method1}`)

    // Method 2: ABI encode (what the contract might use)
    const method2 = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["address"], [userAddress])
    )
    console.log(`Method 2 (abi.encode): ${method2}`)

    // Check both methods against management keys
    const isMethod1InMgmt = managementKeys.includes(method1)
    const isMethod2InMgmt = managementKeys.includes(method2)

    console.log(`\n🎯 Key matching results:`)
    console.log(`   Method 1 in management keys: ${isMethod1InMgmt}`)
    console.log(`   Method 2 in management keys: ${isMethod2InMgmt}`)

    // If method2 works, check permissions with that
    if (isMethod2InMgmt) {
      console.log(`\n✅ Found user with method 2! Checking permissions...`)
      const hasPurpose1_v2 = await onchainId.keyHasPurpose(method2, 1)
      const hasPurpose3_v2 = await onchainId.keyHasPurpose(method2, 3)
      console.log(`   Purpose 1 (MANAGEMENT): ${hasPurpose1_v2}`)
      console.log(`   Purpose 3 (CLAIM): ${hasPurpose3_v2}`)
    }

    // Final analysis
    console.log(`\n💡 Analysis:`)
    if (!hasPurpose1 && !isMethod1InMgmt && !isMethod2InMgmt) {
      console.log(
        `❌ User does NOT have management permissions despite being deployer`
      )
      console.log(`🤔 Possible explanations:`)
      console.log(`   1. IdFactory sets a different address as initial manager`)
      console.log(`   2. Management was transferred after deployment`)
      console.log(`   3. Different key hashing method is used`)
      console.log(`   4. Proxy pattern where deployer ≠ initializer`)
    } else {
      console.log(
        `✅ User DOES have management permissions (as expected for deployer)`
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
