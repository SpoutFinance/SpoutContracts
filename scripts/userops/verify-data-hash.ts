const { ethers } = require("hardhat")

async function main() {
  console.log("🔍 Verifying data hash from transaction...")

  // The hash from your transaction
  const txDataHash =
    "0xf10451f2068956fc6b77c861ed53a001af01cf7ac253ae3e3e8e4145a5f43c53"
  console.log("📋 Transaction data hash:", txDataHash)

  // Let's check what different claim data would hash to
  const claimTexts = ["KYC", "KYC passed", ""]

  for (const text of claimTexts) {
    const claimData = ethers.utils.toUtf8Bytes(text)
    const claimDataHash = ethers.utils.keccak256(claimData)

    console.log(`\n"${text}":`)
    console.log("  Data bytes:", ethers.utils.hexlify(claimData))
    console.log("  Data hash: ", claimDataHash)
    console.log(
      "  Matches tx:",
      claimDataHash === txDataHash ? "✅ YES" : "❌ NO"
    )
  }

  console.log("\n🔍 Transaction analysis:")
  console.log("Your transaction shows:")
  console.log("  _topic: 1 (KYC) ✅")
  console.log("  _scheme: 1 ✅")
  console.log("  _issuer: 0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7 ❌ WRONG!")
  console.log(
    "  _signature: 0x3733343b20ad7a0f14189491147650dea2b63cf470c0b140840a06364e8671667797916251cf20529efb6f282a926ea20d3bcdd6fd567c4987f517c38fa31da71c"
  )
  console.log(
    "  _data: 0xf10451f2068956fc6b77c861ed53a001af01cf7ac253ae3e3e8e4145a5f43c53"
  )

  console.log("\n❌ PROBLEM IDENTIFIED:")
  console.log(
    "The issuer in your transaction is 0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"
  )
  console.log(
    "But it should be: 0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F (ClaimIssuer)"
  )
  console.log("\n💡 This confirms the frontend is using wrong signer context!")
}

main().catch(console.error)
