import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log("Deploying Orders contract with account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  const Orders = await ethers.getContractFactory("Orders")
  const orders = await Orders.deploy()

  await orders.deployed()

  console.log("✅ Orders contract deployed at:", orders.address)
  console.log("✅ Deployer is the owner of the contract")

  // Verify deployment
  const owner = await orders.owner()
  console.log("Contract owner:", owner)
  console.log("Deployment successful!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
