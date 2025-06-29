import { ethers } from "hardhat"

async function main() {
  console.log("🔍 Checking Claim Signer Permission...")

  const onchainIdAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6"
  const recipientAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5"

  console.log("OnchainID:", onchainIdAddress)
  console.log("Recipient:", recipientAddress)

  // Try multiple RPC endpoints for Base Sepolia
  const rpcEndpoints = [
    "https://sepolia.base.org",
    "https://base-sepolia.blockpi.network/v1/rpc/public",
    "https://base-sepolia-rpc.publicnode.com",
    "https://1rpc.io/base-sepolia",
  ]

  for (let i = 0; i < rpcEndpoints.length; i++) {
    const rpcUrl = rpcEndpoints[i]
    console.log(`\n🔄 Trying RPC ${i + 1}: ${rpcUrl}`)

    try {
      // Create custom provider with this RPC
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

      // Verify we're on the right network
      const network = await provider.getNetwork()
      if (network.chainId !== 84532) {
        console.log(`❌ Wrong network (Chain ID: ${network.chainId})`)
        continue
      }
      console.log("✅ Correct network (Base Sepolia)")

      // Check if contract exists on this RPC
      const code = await provider.getCode(onchainIdAddress)
      if (code === "0x") {
        console.log("❌ Contract not found on this RPC")
        continue
      }

      console.log("✅ Contract found! Code length:", code.length)

      // Calculate the user key exactly like frontend
      const userKey = ethers.utils.keccak256(
        ethers.utils.solidityPack(["address"], [recipientAddress])
      )
      console.log("✅ Calculated User Key:", userKey)

      // Create contract instance with this provider
      const abi = [
        "function keyHasPurpose(bytes32 _key, uint256 _purpose) external view returns (bool)",
        "function owner() external view returns (address)",
        "function getKeysByPurpose(uint256 _purpose) external view returns (bytes32[])",
      ]
      const contract = new ethers.Contract(onchainIdAddress, abi, provider)

      // Check if user has claim signer permission (purpose 3)
      console.log("\n🔑 Checking Claim Signer Permission...")
      const hasClaimPurpose = await contract.keyHasPurpose(userKey, 3)

      if (hasClaimPurpose) {
        console.log("✅ YES - Recipient HAS claim signer permission!")
        console.log("🎯 The recipient can sign claims")
        console.log("🎯 Your frontend keyHasPurpose() should return TRUE")
      } else {
        console.log("❌ NO - Recipient does NOT have claim signer permission")
        console.log("🔧 Need to call addKey() to grant purpose 3 (CLAIM)")
        console.log("🔧 Your frontend keyHasPurpose() should return FALSE")
      }

      // Also check other purposes for completeness
      console.log("\n📋 All Purposes for this User:")
      const purposes = [1, 2, 3, 4]
      const purposeNames = ["MANAGEMENT", "ACTION", "CLAIM", "ENCRYPTION"]

      for (let j = 0; j < purposes.length; j++) {
        try {
          const hasPurpose = await contract.keyHasPurpose(userKey, purposes[j])
          const status = hasPurpose ? "✅ YES" : "❌ NO"
          console.log(`${status} Purpose ${purposes[j]} (${purposeNames[j]})`)
        } catch (error) {
          console.log(
            `❌ Error checking purpose ${purposes[j]}:`,
            error.message.slice(0, 50)
          )
        }
      }

      // Check who owns this OnchainID
      console.log("\n👤 OnchainID Owner Check:")
      try {
        const owner = await contract.owner()
        console.log("Owner:", owner)
        const isRecipientOwner =
          owner.toLowerCase() === recipientAddress.toLowerCase()
        console.log(
          "Recipient is owner:",
          isRecipientOwner ? "✅ YES" : "❌ NO"
        )

        if (!isRecipientOwner) {
          console.log(
            "⚠️  Note: Only the owner can call addKey() to grant permissions"
          )
        }
      } catch (error) {
        console.log("❌ Error getting owner:", error.message.slice(0, 50))
      }

      // If we got here successfully, we found a working RPC
      console.log("\n🎉 SUCCESS! Found working RPC:", rpcUrl)
      console.log("\n📝 Summary:")
      if (hasClaimPurpose) {
        console.log("✅ Permission exists - your frontend should work!")
      } else {
        console.log("❌ Permission missing - call addKey() first")
        console.log(
          "   addKey(userKey, 3, 1) // purpose 3 = CLAIM, type 1 = ECDSA"
        )
      }

      return // Exit successfully
    } catch (error) {
      console.log(`❌ RPC ${i + 1} failed:`, error.message.slice(0, 100))
      if (i === rpcEndpoints.length - 1) {
        console.log("\n💥 All RPC endpoints failed!")
        console.log("This might indicate a broader network issue")
        console.log("Try checking directly in your frontend browser console")
      }
    }
  }

  console.log(
    "\n🔧 Alternative: Check directly in your frontend browser console:"
  )
  console.log(
    "const userKey = ethers.utils.keccak256(ethers.utils.solidityPack(['address'], ['" +
      recipientAddress +
      "']));"
  )
  console.log(
    "const result = await identityContract.keyHasPurpose(userKey, 3);"
  )
  console.log("console.log('Has claim permission:', result);")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
