import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  const contractAddress = "0x0070EA7A0CAD2Fb571DE4B90Cc1DdEA9268aDc0f"

  console.log("Verifying Orders contract at:", contractAddress)
  console.log("Using account:", deployer.address)

  // Try to get the contract
  const Orders = await ethers.getContractFactory("Orders")
  const orders = Orders.attach(contractAddress)

  console.log("Contract attached successfully")

  // Check if contract exists
  const code = await ethers.provider.getCode(contractAddress)
  console.log("Contract has code:", code !== "0x")
  console.log("Code length:", code.length)

  // Try to call some basic functions
  try {
    console.log("Trying to call owner()...")
    const owner = await orders.owner()
    console.log("✅ Owner:", owner)
  } catch (error) {
    console.log("❌ Error calling owner():", error.message)
  }

  try {
    console.log("Trying to get pendingBuyOrders with dummy requestId...")
    const dummyRequestId =
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    const order = await orders.pendingBuyOrders(dummyRequestId)
    console.log("✅ pendingBuyOrders call successful")
  } catch (error) {
    console.log("❌ Error calling pendingBuyOrders:", error.message)
  }

  // Check the contract interface
  console.log("\nContract interface functions:")
  const contractInterface = orders.interface
  Object.keys(contractInterface.functions).forEach((func) => {
    console.log("-", func)
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
