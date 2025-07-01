import { ethers } from "ethers"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address

  console.log("🔍 Finding OnchainID deployer using BaseScan API...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`User Address: ${userAddress}`)

  try {
    // Use BaseScan API to get contract creation transaction
    const baseScanApiKey = "6K189QVWH4VBQY1NE7J2GKICUES2PYBP3B" // From hardhat config
    const apiUrl = `https://api-sepolia.basescan.org/api?module=contract&action=getcontractcreation&contractaddresses=${onchainIdAddress}&apikey=${baseScanApiKey}`

    console.log("\n📡 Calling BaseScan API...")

    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data.status === "1" && data.result && data.result.length > 0) {
      const creationInfo = data.result[0]

      console.log("\n✅ Contract creation found!")
      console.log(`📦 Contract Address: ${creationInfo.contractAddress}`)
      console.log(`👤 Creator Address: ${creationInfo.contractCreator}`)
      console.log(`🔗 Creation Transaction: ${creationInfo.txHash}`)

      if (
        creationInfo.contractCreator.toLowerCase() === userAddress.toLowerCase()
      ) {
        console.log("\n✅ USER IS THE DEPLOYER!")
      } else {
        console.log("\n❌ User is NOT the deployer")
        console.log(`Expected: ${userAddress}`)
        console.log(`Actual: ${creationInfo.contractCreator}`)
      }

      // Let's also get the transaction details to see constructor arguments
      const provider = new ethers.providers.JsonRpcProvider(
        "https://sepolia.base.org"
      )

      try {
        const tx = await provider.getTransaction(creationInfo.txHash)
        console.log(`\n📝 Transaction details:`)
        console.log(`From: ${tx.from}`)
        console.log(`Gas Used: ${tx.gasLimit?.toString() || "N/A"}`)
        console.log(`Gas Price: ${tx.gasPrice?.toString() || "N/A"}`)

        if (tx.data && tx.data.length > 10) {
          console.log(`Constructor data length: ${tx.data.length} characters`)

          // Look for address patterns in constructor data
          const addressPattern = /000000000000000000000000([a-fA-F0-9]{40})/g
          const matches = [...tx.data.matchAll(addressPattern)]

          if (matches.length > 0) {
            console.log("\n🔍 Addresses found in constructor:")
            matches.forEach((match, index) => {
              const addr = "0x" + match[1]
              console.log(`   ${index + 1}. ${addr}`)

              if (addr.toLowerCase() === userAddress.toLowerCase()) {
                console.log("      ✅ This matches the user address!")
              } else if (
                addr.toLowerCase() ===
                creationInfo.contractCreator.toLowerCase()
              ) {
                console.log("      ✅ This matches the deployer address!")
              }
            })

            console.log("\n💡 Analysis:")
            console.log(
              "- The first address in constructor is likely the initialManagementKey"
            )
            console.log(
              "- If user address is in constructor, they should have had management rights initially"
            )
            console.log("- If not, someone else was set as the initial manager")
          }
        }
      } catch (e) {
        console.log("❌ Could not get transaction details:", (e as any).message)
      }
    } else {
      console.log("❌ No creation information found")
      console.log("Response:", JSON.stringify(data, null, 2))
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
