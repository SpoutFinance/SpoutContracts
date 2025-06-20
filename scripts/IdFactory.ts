import { ethers } from "hardhat"

async function main() {
  // 2. Deploy the IdFactory
  const IdFactory = await ethers.getContractFactory("IdFactory")
  const idFactory = await IdFactory.deploy(
    "0xBD456121D833e3d29Ef83c86f8dc57c97630878A"
  )
  await idFactory.deployed()

  console.log("IdFactory deployed to:", idFactory.address)
  console.log("\nDeployment complete!")
  console.log(
    "You can now use this IdFactory address in your TREXFactory deployment."
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
