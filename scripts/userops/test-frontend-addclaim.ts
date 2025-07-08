const { ethers } = require("hardhat")

// Exact same values as frontend
const userWalletAddress = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717"
const userOnchainID = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"
const issuerAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"

// Mock signature data (replace with real signature if you have it)
const mockSignature = {
  r: "0x3733343b20ad7a0f14189491147650dea2b63cf470c0b140840a06364e866716",
  s: "0x7797916251cf20529efb6f282a926ea20d3bcdd6fd567c4987f517c38fa31da7",
  v: 28,
}

async function main() {
  console.log("🧪 Testing exact frontend addClaim call...")
  console.log("👤 User wallet:", userWalletAddress)
  console.log("🆔 User OnchainID:", userOnchainID)
  console.log("🏢 Issuer address:", issuerAddress)

  // Get contract instance
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    userOnchainID
  )

  // EXACT MATCH: Mimic frontend claim data preparation
  const topic = 1

  // Frontend uses: ethers.toUtf8Bytes("KYC") - but this is ethers v6
  // For hardhat (ethers v5), use: ethers.utils.toUtf8Bytes("KYC")
  const claimData = ethers.utils.toUtf8Bytes("KYC passed")
  const claimDataHash = ethers.utils.keccak256(claimData)

  console.log("📝 Claim data bytes:", ethers.utils.hexlify(claimData))
  console.log("🔒 Claim data hash:", claimDataHash)

  // Reconstruct signature the same way as frontend
  const r = mockSignature.r
  const s = mockSignature.s
  const v = `0x${mockSignature.v.toString(16).padStart(2, "0")}`

  // Manual concat instead of concatHex (which is viem)
  const signature = r + s.slice(2) + v.slice(2)

  console.log("🔍 Signature components:")
  console.log("   r:", r)
  console.log("   s:", s)
  console.log("   v:", v)
  console.log("   Final signature:", signature)

  // EXACT MATCH: Contract arguments like frontend
  const contractArgs = [
    topic, // topic (KYC)
    1, // scheme
    issuerAddress, // issuer address
    signature, // signature
    claimDataHash, // hashed claim data
    "", // uri
  ]

  console.log("📋 Contract arguments:", contractArgs)

  // First, check current permissions
  const userKeyHash = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [userWalletAddress])
  )

  const hasClaimKey = await identity.keyHasPurpose(userKeyHash, 3)
  console.log("🔑 User has claim key before call:", hasClaimKey)

  // Try to simulate the call without actually executing it
  try {
    console.log("\n🔄 Simulating addClaim call...")

    // Use callStatic to simulate the call
    const result = await identity.callStatic.addClaim(
      topic,
      1,
      issuerAddress,
      signature,
      claimDataHash,
      ""
    )

    console.log("✅ Call simulation successful!")
    console.log("📄 Result:", result)
  } catch (error) {
    console.log("❌ Call simulation failed:")
    console.log("   Error:", error.message)

    // Check if it's the permissions error
    if (error.message.includes("claim signer key")) {
      console.log("\n🔍 DEBUGGING: Why no claim signer key?")

      // Check the modifier logic
      const isManager = await identity.keyHasPurpose(userKeyHash, 1)
      const isClaimSigner = await identity.keyHasPurpose(userKeyHash, 3)

      console.log("   📋 keyHasPurpose(userKey, 1):", isManager)
      console.log("   📋 keyHasPurpose(userKey, 3):", isClaimSigner)

      // The onlyClaimKey modifier checks: msg.sender == address(this) || keyHasPurpose(keccak256(abi.encode(msg.sender)), 3)
      console.log("\n💡 The onlyClaimKey modifier logic:")
      console.log("   - msg.sender == address(this): false (external call)")
      console.log("   - keyHasPurpose(hash(msg.sender), 3):", isClaimSigner)

      if (!isClaimSigner) {
        console.log("❌ This explains the error - user doesn't have claim key!")
      } else {
        console.log("🤔 User has claim key but still failing - deeper issue")
      }
    }
  }

  // Also test if the signature validation might be the issue
  console.log("\n🔍 Testing ClaimIssuer signature validation...")
  const claimIssuer = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer",
    issuerAddress
  )

  try {
    const isValidSignature = await claimIssuer.isClaimValid(
      userOnchainID,
      topic,
      signature,
      claimDataHash
    )
    console.log("✅ ClaimIssuer validates signature:", isValidSignature)
  } catch (error) {
    console.log("❌ ClaimIssuer signature validation failed:", error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
