import { ethers } from "hardhat"

async function main() {
  // --- Paste the user's ONCHAINID address here ---
  const onchainIdAddress = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B" // <-- Replace with ONCHAINID address
  // --- Paste the issuer (trusted claim issuer) address here ---
  const [deployer] = await ethers.getSigners()

  const issuer = deployer.address // <-- Replace with issuer address

  const claimTopic = 1 // KYC
  const scheme = 1 // ECDSA
  const data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("KYC passed")) // Example data
  // --- TODO: Generate a valid ECDSA signature for the claim off-chain and paste it here ---
  const signature =
    "0xfa49bdaf61a78460cb070104049994589df926fb4e63e471d42a5c2b078a5c495753a69201e90fc07e46496bd9bc3b5675073a51b5fd5f805f3951020364017f1c" // <-- Replace with a valid signature
  const uri = ""

  const Identity = await ethers.getContractFactory(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity"
  )
  const onchainId = Identity.attach(onchainIdAddress)

  const tx = await onchainId.addClaim(
    claimTopic,
    scheme,
    issuer,
    signature,
    data,
    uri
  )
  await tx.wait()
  console.log(`✅ Added KYC claim (topic 1) to ONCHAINID ${onchainIdAddress}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
