import { ethers } from "ethers"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address

  console.log("🔍 Finding OnchainID deployer...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`User Address: ${userAddress}`)

  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.base.org"
  )

  try {
    // Method 1: Check if we can find creation transaction via trace/debug APIs
    console.log("\n📡 Searching for contract creation transaction...")

    // We'll scan recent blocks to find the contract creation
    // This is a brute force approach but should work for recent contracts
    const currentBlock = await provider.getBlockNumber()
    console.log(`Current block: ${currentBlock}`)

    // Search backwards from current block (limit search to prevent timeout)
    const searchLimit = 1000 // Search last 1000 blocks
    let foundCreation = false

    for (
      let blockNum = currentBlock;
      blockNum > currentBlock - searchLimit && !foundCreation;
      blockNum--
    ) {
      try {
        const block = await provider.getBlockWithTransactions(blockNum)

        for (const tx of block.transactions) {
          // Check if this transaction created our contract
          if (tx.to === null) {
            // Contract creation transactions have null 'to' field
            const receipt = await provider.getTransactionReceipt(tx.hash)

            if (
              receipt.contractAddress?.toLowerCase() ===
              onchainIdAddress.toLowerCase()
            ) {
              console.log("\n✅ Found contract creation transaction!")
              console.log(`📦 Block Number: ${receipt.blockNumber}`)
              console.log(`🔗 Transaction Hash: ${tx.hash}`)
              console.log(`👤 Deployer Address: ${tx.from}`)
              console.log(`💰 Gas Used: ${receipt.gasUsed.toString()}`)
              console.log(`⛽ Gas Price: ${tx.gasPrice?.toString() || "N/A"}`)

              if (tx.from.toLowerCase() === userAddress.toLowerCase()) {
                console.log("\n✅ USER IS THE DEPLOYER!")
              } else {
                console.log("\n❌ User is NOT the deployer")
                console.log(`Expected: ${userAddress}`)
                console.log(`Actual: ${tx.from}`)
              }

              // Let's also check the constructor arguments
              if (tx.data && tx.data.length > 10) {
                console.log(
                  `\n📝 Constructor data length: ${tx.data.length} characters`
                )
                console.log(`Constructor data: ${tx.data.slice(0, 100)}...`)

                // Try to decode if we can identify the initialManagementKey
                // This would be in the constructor arguments
                console.log("\n🔍 Analyzing constructor arguments...")

                // The constructor takes (address initialManagementKey, bool _isLibrary)
                // Look for address patterns in the constructor data
                const addressPattern =
                  /000000000000000000000000([a-fA-F0-9]{40})/g
                const matches = [...tx.data.matchAll(addressPattern)]

                if (matches.length > 0) {
                  console.log("📋 Potential addresses in constructor:")
                  matches.forEach((match, index) => {
                    const addr = "0x" + match[1]
                    console.log(`   ${index + 1}. ${addr}`)

                    if (addr.toLowerCase() === userAddress.toLowerCase()) {
                      console.log("      ✅ This matches the user address!")
                    } else if (addr.toLowerCase() === tx.from.toLowerCase()) {
                      console.log("      ✅ This matches the deployer address!")
                    }
                  })
                }
              }

              foundCreation = true
              break
            }
          }
        }

        // Progress indicator
        if (blockNum % 100 === 0) {
          console.log(
            `Searching block ${blockNum} (${
              currentBlock - blockNum
            } blocks searched)...`
          )
        }
      } catch (e) {
        // Skip blocks we can't access
        continue
      }
    }

    if (!foundCreation) {
      console.log(
        `\n❌ Contract creation not found in last ${searchLimit} blocks`
      )
      console.log("The contract might be older or deployed via a proxy/factory")

      // Alternative: Check if it's a proxy by looking for implementation patterns
      console.log("\n🔍 Checking if this might be a proxy contract...")

      const code = await provider.getCode(onchainIdAddress)
      if (
        code.includes(
          "7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        )
      ) {
        console.log("✅ This looks like an EIP-1967 proxy contract")
      } else if (code.includes("5c60da1b")) {
        console.log(
          "✅ This looks like a proxy contract (implementation() function)"
        )
      } else {
        console.log("❓ This doesn't appear to be a standard proxy")
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
