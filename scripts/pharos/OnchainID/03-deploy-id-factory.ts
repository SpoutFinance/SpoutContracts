import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed ImplementationAuthority address here ---
  const IMPLEMENTATION_AUTHORITY_ADDRESS =
    "0x7333b14f2cD1418e0358d0e2A698d590f995daab" // <-- Replace with deployed ImplementationAuthority address

  const IdFactory = await ethers.getContractFactory("IdFactory")
  const idFactory = await IdFactory.deploy(IMPLEMENTATION_AUTHORITY_ADDRESS)
  await idFactory.deployed()
  console.log("✅ IdFactory deployed at:", idFactory.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
