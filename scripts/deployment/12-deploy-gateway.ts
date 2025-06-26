import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed IdFactory address here ---
  const ID_FACTORY_ADDRESS = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536" // <-- Replace with deployed IdFactory address

  // --- Optionally, add approved signer addresses here ---
  const SIGNERS_TO_APPROVE: string[] = [
    "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7",
  ]

  const Gateway = await ethers.getContractFactory("Gateway")
  const gateway = await Gateway.deploy(ID_FACTORY_ADDRESS, SIGNERS_TO_APPROVE)
  await gateway.deployed()
  console.log("✅ Gateway deployed at:", gateway.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
