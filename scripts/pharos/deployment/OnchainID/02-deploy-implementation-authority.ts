import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed Identity logic address here ---
  const IDENTITY_LOGIC_ADDRESS = "0x0f93199b887B5C9b0a66bdB581a4E8D1093617b0" // <-- Replace with deployed Identity.sol address

  const ImplementationAuthority = await ethers.getContractFactory(
    "ImplementationAuthority"
  )
  const ia = await ImplementationAuthority.deploy(IDENTITY_LOGIC_ADDRESS)
  await ia.deployed()
  console.log("✅ ImplementationAuthority deployed at:", ia.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
