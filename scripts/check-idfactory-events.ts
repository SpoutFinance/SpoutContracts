import { ethers } from "ethers"

async function main() {
  const onchainIdAddress = "0x5e57F2ba1Fe97bC5e79c48dd3B5058Bd5Da661b5" // OnchainID
  const userAddress = "0x937401b8d17827e253ce8585b90a4677a283cdc6" // User address
  const idFactoryAddress = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // From BaseSepolia.json

  console.log("🔍 Checking IdFactory events...")
  console.log(`OnchainID Address: ${onchainIdAddress}`)
  console.log(`User Address: ${userAddress}`)
  console.log(`IdFactory Address: ${idFactoryAddress}`)

  const provider = new ethers.providers.JsonRpcProvider(
    "https://sepolia.base.org"
  )

  // IdFactory ABI for events
  const idFactoryAbi = [
    "event Deployed(address _addr)",
    "event IdCreated(address indexed _identity, string indexed _salt, address indexed _wallet)",
    "function createIdentity(address _wallet, string memory _salt) external returns (address)",
    "function createIdentityWithManagementKeys(address _wallet, string memory _salt, address[] memory _managementKeys) external returns (address)",
  ]

  const idFactory = new ethers.Contract(
    idFactoryAddress,
    idFactoryAbi,
    provider
  )

  try {
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 50000) // Search last 50k blocks

    console.log(
      `\n📡 Searching events from block ${fromBlock} to ${currentBlock}...`
    )

    // Get IdCreated events
    console.log("\n🎯 Looking for IdCreated events...")
    const idCreatedFilter = idFactory.filters.IdCreated()
    const idCreatedEvents = await idFactory.queryFilter(
      idCreatedFilter,
      fromBlock,
      currentBlock
    )

    console.log(`Found ${idCreatedEvents.length} IdCreated events`)

    let foundOurId = false

    for (const event of idCreatedEvents) {
      const identity = event.args?._identity
      const salt = event.args?._salt
      const wallet = event.args?._wallet

      console.log(`\n📋 IdCreated Event:`)
      console.log(`   Identity: ${identity}`)
      console.log(`   Salt: ${salt}`)
      console.log(`   Wallet: ${wallet}`)
      console.log(`   Block: ${event.blockNumber}`)
      console.log(`   Transaction: ${event.transactionHash}`)

      if (identity?.toLowerCase() === onchainIdAddress.toLowerCase()) {
        console.log("\n✅ FOUND OUR ONCHAINID!")
        foundOurId = true

        // Get the transaction details
        const tx = await provider.getTransaction(event.transactionHash)
        console.log(`👤 Transaction Sender: ${tx.from}`)

        if (tx.from.toLowerCase() === userAddress.toLowerCase()) {
          console.log("✅ USER deployed the OnchainID via IdFactory!")
        } else {
          console.log("❌ Someone else deployed the OnchainID via IdFactory")
        }

        if (wallet?.toLowerCase() === userAddress.toLowerCase()) {
          console.log("✅ User was set as the wallet parameter")
        } else {
          console.log(`❌ Different wallet was set: ${wallet}`)
        }

        // This explains why user might not have management keys -
        // the wallet parameter might not automatically get management keys
        console.log("\n💡 Analysis:")
        console.log("- IdFactory was used to create the OnchainID")
        console.log(
          "- The 'wallet' parameter in createIdentity might not automatically get management keys"
        )
        console.log(
          "- Management keys might be set separately or via a different parameter"
        )
      }
    }

    if (!foundOurId) {
      console.log("\n❌ OnchainID not found in IdFactory events")
      console.log(
        "It might have been deployed differently or outside the search range"
      )
    }

    // Also check Deployed events
    console.log("\n🔍 Checking general Deployed events...")
    const deployedFilter = idFactory.filters.Deployed()
    const deployedEvents = await idFactory.queryFilter(
      deployedFilter,
      fromBlock,
      currentBlock
    )

    console.log(`Found ${deployedEvents.length} Deployed events`)

    for (const event of deployedEvents) {
      const addr = event.args?._addr
      if (addr?.toLowerCase() === onchainIdAddress.toLowerCase()) {
        console.log(`\n✅ Found OnchainID in Deployed event!`)
        console.log(`   Address: ${addr}`)
        console.log(`   Block: ${event.blockNumber}`)
        console.log(`   Transaction: ${event.transactionHash}`)
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
