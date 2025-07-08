const { ethers } = require("hardhat")

// Your test signature from testclaim.ts
const signature =
  "0x3733343b20ad7a0f14189491147650dea2b63cf470c0b140840a06364e8671667797916251cf20529efb6f282a926ea20d3bcdd6fd567c4987f517c38fa31da71c"

// Addresses from your frontend
const userOnchainID = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"
const claimIssuerAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"

async function main() {
  console.log("🔍 Testing signature validation...")
  console.log("🆔 User OnchainID:", userOnchainID)
  console.log("🏢 ClaimIssuer:", claimIssuerAddress)
  console.log("✍️  Signature:", signature)

  // Get ClaimIssuer contract
  const claimIssuer = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer",
    claimIssuerAddress
  )

  // Test different claim data variations to match what your frontend uses
  const testCases = [
    {
      name: "Frontend style (KYC)",
      claimData: ethers.utils.toUtf8Bytes("KYC"),
      getHash: (data) => ethers.utils.keccak256(data),
    },
    {
      name: "Script style (KYC passed)",
      claimData: ethers.utils.toUtf8Bytes("KYC passed"),
      getHash: (data) => ethers.utils.keccak256(data),
    },
    {
      name: "Hash from testclaim.ts",
      claimData: ethers.utils.keccak256(ethers.utils.toUtf8Bytes("KYC passed")),
      getHash: (data) => data, // already hashed
    },
  ]

  const topic = 1

  for (let testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`)

    const claimDataHash = testCase.getHash(testCase.claimData)
    console.log("📝 Claim data:", ethers.utils.hexlify(testCase.claimData))
    console.log("🔒 Claim data hash:", claimDataHash)

    try {
      // Test ClaimIssuer signature validation
      const isValid = await claimIssuer.isClaimValid(
        userOnchainID,
        topic,
        signature,
        claimDataHash
      )
      console.log("✅ ClaimIssuer validates signature:", isValid)

      if (isValid) {
        console.log("🎉 FOUND WORKING COMBINATION!")

        // Now test if addClaim would work with this data
        const identity = await ethers.getContractAt(
          "contracts/Onchain-ID/contracts/Identity.sol:Identity",
          userOnchainID
        )

        try {
          console.log("🧪 Testing addClaim with this data...")

          // Use callStatic to simulate the call
          const result = await identity.callStatic.addClaim(
            topic,
            1, // scheme
            claimIssuerAddress,
            signature,
            claimDataHash,
            "" // uri
          )

          console.log("✅ addClaim simulation successful!")
          console.log("📄 Result:", result)

          console.log("\n🔧 SOLUTION FOUND!")
          console.log(`   Use claim data: ${testCase.name}`)
          console.log(`   Claim data hash: ${claimDataHash}`)
        } catch (addClaimError) {
          console.log("❌ addClaim still fails:", addClaimError.message)
        }
      }
    } catch (error) {
      console.log("❌ ClaimIssuer validation failed:", error.message)

      // If it's a claim signer key error, let's debug further
      if (error.message.includes("claim signer key")) {
        console.log("🔍 This error is from ClaimIssuer, not Identity!")

        // Check if the recovered address has claim key on ClaimIssuer
        console.log("🔍 Debugging signature recovery...")

        // Recreate the message hash that should have been signed
        const dataHash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "bytes"],
            [userOnchainID, topic, claimDataHash]
          )
        )
        console.log("📦 Data hash for signing:", dataHash)

        const prefixedHash = ethers.utils.hashMessage(
          ethers.utils.arrayify(dataHash)
        )
        console.log("🔐 Prefixed hash:", prefixedHash)

        try {
          const recoveredAddress = ethers.utils.recoverAddress(
            prefixedHash,
            signature
          )
          console.log("🔍 Recovered address:", recoveredAddress)

          // Check if this address has claim key on ClaimIssuer
          const recoveredKeyHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [recoveredAddress])
          )

          const hasClaimKey = await claimIssuer.keyHasPurpose(
            recoveredKeyHash,
            3
          )
          console.log(
            "🔑 Recovered address has claim key on ClaimIssuer:",
            hasClaimKey
          )

          if (!hasClaimKey) {
            console.log(
              "❌ This explains the error - recovered address doesn't have claim key on ClaimIssuer!"
            )
          }
        } catch (recoverError) {
          console.log("❌ Signature recovery failed:", recoverError.message)
        }
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
