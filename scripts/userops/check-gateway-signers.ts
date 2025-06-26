import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed Gateway contract address here ---
  const GATEWAY_ADDRESS = "0xf04430Ffe6da40FE233c50909A9ebEA43dc8FDaB"

  // --- List of addresses to check ---
  // Add all addresses you want to check for approval status
  const addressesToCheck = [
    "0x92b9baa72387fb845d8fe88d2a14113f9cb2c4e7",
    // "0xYourSignerAddress2",
    // ...
  ]

  const gateway = await ethers.getContractAt("Gateway", GATEWAY_ADDRESS)

  console.log(`Checking approved signers in Gateway at: ${GATEWAY_ADDRESS}`)
  for (const addr of addressesToCheck) {
    const isApproved = await gateway.approvedSigners(addr)
    console.log(`${addr}: ${isApproved ? "✅ Approved" : "❌ Not approved"}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
