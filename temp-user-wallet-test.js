// TEMPORARY SCRIPT FOR TESTING WITH USER'S WALLET
// Only use this if you want to test backend flow with user's actual wallet

const { ethers } = require("hardhat")

async function main() {
  console.log("🧪 Testing addClaim with user's wallet context...")

  // NOTE: To use this script, temporarily update hardhat.config.js:
  // Replace PRIVATE_KEY with the user's private key in your .env
  // "base-sepolia": {
  //   url: "https://base-sepolia.g.alchemy.com/v2/jZMXG1ZQfY6Yvu_PmDJxWrasqdnym3Uy",
  //   accounts: [vars.get("USER_PRIVATE_KEY")], // <- Change this
  // },

  const [signer] = await ethers.getSigners()
  console.log("🔑 Current signer:", signer.address)
  console.log("🎯 Expected user: 0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717")

  if (
    signer.address.toLowerCase() !==
    "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717".toLowerCase()
  ) {
    console.log(
      "❌ Wrong signer! Update hardhat.config.js with user's private key"
    )
    return
  }

  console.log("✅ Correct signer! Now testing addClaim...")

  // Your exact test from frontend
  const userOnchainID = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"
  const claimIssuerAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"

  const signature =
    "0x3733343b20ad7a0f14189491147650dea2b63cf470c0b140840a06364e8671667797916251cf20529efb6f282a926ea20d3bcdd6fd567c4987f517c38fa31da71c"

  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    userOnchainID
  )

  const topic = 1
  const claimData = ethers.utils.toUtf8Bytes("KYC passed")
  const claimDataHash = ethers.utils.keccak256(claimData)

  console.log("📋 Contract arguments:")
  const contractArgs = [
    topic,
    1, // scheme
    claimIssuerAddress,
    signature,
    claimDataHash,
    "",
  ]
  console.log(contractArgs)

  try {
    console.log("🔄 Adding claim with user's actual wallet...")
    const tx = await identity.addClaim(...contractArgs)
    console.log("📡 Transaction hash:", tx.hash)

    console.log("⏳ Waiting for confirmation...")
    await tx.wait()
    console.log("✅ SUCCESS! Claim added by user's wallet")
  } catch (error) {
    console.log("❌ Error:", error.message)
  }
}

main().catch(console.error)

// INSTRUCTIONS:
// 1. Add USER_PRIVATE_KEY to your .env file
// 2. Update hardhat.config.js to use USER_PRIVATE_KEY instead of PRIVATE_KEY
// 3. Run: npx hardhat run temp-user-wallet-test.js --network base-sepolia
// 4. Restore original config after testing
