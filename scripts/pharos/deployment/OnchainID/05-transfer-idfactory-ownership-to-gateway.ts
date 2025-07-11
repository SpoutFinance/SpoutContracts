import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed contract addresses here ---
  const ID_FACTORY_ADDRESS = "0x18cB5F2774a80121d1067007933285B32516226a" // <-- Replace with deployed IdFactory address
  const GATEWAY_ADDRESS = "0x126F0c11F3e5EafE37AB143D4AA688429ef7DCB3" // <-- Replace with deployed Gateway address

  const IdFactory = await ethers.getContractFactory("IdFactory")
  const idFactory = IdFactory.attach(ID_FACTORY_ADDRESS)

  const tx = await idFactory.transferOwnership(GATEWAY_ADDRESS)
  await tx.wait()

  console.log(
    `✅ IdFactory ownership transferred to Gateway at: ${GATEWAY_ADDRESS}`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
