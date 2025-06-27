import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed contract addresses here ---
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // <-- Replace with deployed IdFactory address
  const GATEWAY_ADDRESS = "0xf04430Ffe6da40FE233c50909A9ebEA43dc8FDaB" // <-- Replace with deployed Gateway address

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
