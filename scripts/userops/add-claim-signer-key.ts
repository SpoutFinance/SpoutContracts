import { ethers } from "hardhat"

async function main() {
  // --- Paste the ONCHAINID (Identity) contract address here ---
  const onchainIdAddress = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B" // <-- Replace with ONCHAINID address
  // --- Paste the claim signer address here (the address to add as claim signer) ---
  const claimSignerAddress = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7" // <-- Replace with claim signer address
  const CLAIM_SIGNER_PURPOSE = 3
  const ECDSA_TYPE = 1

  // Compute the key (keccak256 of the address)
  const key = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [claimSignerAddress])
  )

  const Identity = await ethers.getContractFactory(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity"
  )
  const onchainId = Identity.attach(onchainIdAddress)

  // This must be sent from the ONCHAINID's management key (the owner)
  const tx = await onchainId.addKey(key, CLAIM_SIGNER_PURPOSE, ECDSA_TYPE)
  await tx.wait()
  console.log("✅ Added claim signer key to ONCHAINID")
}

main().catch(console.error)
