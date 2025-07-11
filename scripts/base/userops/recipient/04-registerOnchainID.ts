const { ethers } = require("hardhat")

async function main() {
  const tokenAddress = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB"
  const verifiedEOA = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7" // Our address
  const verifiedOnchainID = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F" // Our OnchainID with claims

  console.log("🔄 Registering verified address in IdentityRegistry...")
  console.log("EOA to register:", verifiedEOA)
  console.log("OnchainID with claims:", verifiedOnchainID)

  // Get the IdentityRegistry from the token
  const token = await ethers.getContractAt(
    "contracts/ERC3643/token/Token.sol:Token",
    tokenAddress
  )

  const identityRegistryAddress = await token.identityRegistry()
  console.log("📋 IdentityRegistry address:", identityRegistryAddress)

  const identityRegistry = await ethers.getContractAt(
    "contracts/ERC3643/registry/implementation/IdentityRegistry.sol:IdentityRegistry",
    identityRegistryAddress
  )

  // Check if already registered
  const isAlreadyRegistered = await identityRegistry.contains(verifiedEOA)
  console.log("Already registered:", isAlreadyRegistered)

  if (isAlreadyRegistered) {
    console.log("✅ Address is already registered!")

    // Check if verified
    const isVerified = await identityRegistry.isVerified(verifiedEOA)
    console.log("Is verified:", isVerified)

    if (isVerified) {
      console.log("🎉 Ready to mint tokens to this address!")
    } else {
      console.log("❌ Registered but not verified - claims might be missing")
    }
    return
  }

  try {
    console.log("🔄 Registering identity...")
    const tx = await identityRegistry.registerIdentity(
      verifiedEOA,
      verifiedOnchainID,
      91 // country code (example: US = 840, update as needed)
    )

    console.log("📡 Transaction hash:", tx.hash)
    await tx.wait()
    console.log("✅ SUCCESS! Address registered in IdentityRegistry")

    // Verify registration
    const isNowRegistered = await identityRegistry.contains(verifiedEOA)
    const isNowVerified = await identityRegistry.isVerified(verifiedEOA)

    console.log("📋 Final status:")
    console.log("   Registered:", isNowRegistered)
    console.log("   Verified:", isNowVerified)

    if (isNowVerified) {
      console.log("\n🎉 SUCCESS! You can now mint tokens to:", verifiedEOA)
      console.log("💡 Update your Mint-tokens.ts script:")
      console.log(`   const recipient = "${verifiedEOA}"`)
    } else {
      console.log("\n⚠️  Registered but not verified - check claims setup")
    }
  } catch (error) {
    console.log("❌ Error registering identity:", error.message)

    if (error.message.includes("Permissions")) {
      console.log("💡 You might not have agent permissions on IdentityRegistry")
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
