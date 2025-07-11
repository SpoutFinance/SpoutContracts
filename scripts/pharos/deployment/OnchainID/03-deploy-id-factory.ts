import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed ImplementationAuthority address here ---
  const IMPLEMENTATION_AUTHORITY_ADDRESS =
    "0xC6A528AD0035015A2d4659c5D7f72dF460Fd290b" // <-- Replace with deployed ImplementationAuthority address

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
