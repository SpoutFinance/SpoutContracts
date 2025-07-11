import { ethers } from "hardhat"

async function main() {
  const idFactoryAddress = "0x18cB5F2774a80121d1067007933285B32516226a"

  // Get the contract instance
  const IdFactory = await ethers.getContractFactory("IdFactory")
  const idFactory = IdFactory.attach(idFactoryAddress)

  // Get the current owner
  const owner = await idFactory.owner()
  console.log("IdFactory owner:", owner)

  // Get the current caller address
  const [signer] = await ethers.getSigners()
  console.log("Current caller address:", signer.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
