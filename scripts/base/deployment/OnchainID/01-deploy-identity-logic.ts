import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  const Identity = await ethers.getContractFactory("Identity")
  const identity = await Identity.deploy(deployer.address, true) // Library mode, but with deployer as management key
  await identity.deployed()
  console.log("✅ Identity logic contract deployed at:", identity.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
