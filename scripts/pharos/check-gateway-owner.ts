import { ethers } from "hardhat"

async function main() {
  const gatewayAddress = "0x126F0c11F3e5EafE37AB143D4AA688429ef7DCB3"

  // Get the contract instance
  const Gateway = await ethers.getContractFactory("Gateway")
  const gateway = Gateway.attach(gatewayAddress)

  // Get the current owner
  const owner = await gateway.owner()
  console.log("Gateway owner:", owner)

  // Get the current caller address
  const [signer] = await ethers.getSigners()
  console.log("Current caller address:", signer.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
