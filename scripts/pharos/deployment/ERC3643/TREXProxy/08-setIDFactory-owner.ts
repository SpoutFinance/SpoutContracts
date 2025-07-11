import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed contract addresses here ---
  const ID_FACTORY_ADDRESS = "0x18cB5F2774a80121d1067007933285B32516226a"
  const GATEWAY_ADDRESS = "0x126F0c11F3e5EafE37AB143D4AA688429ef7DCB3"
  const TREX_FACTORY_ADDRESS = "0xf7ae103aacd84641fa0c43860c23a8cf7ce5db5a"

  // Get contract instances
  const IdFactory = await ethers.getContractFactory("IdFactory")
  const Gateway = await ethers.getContractFactory("Gateway")

  const idFactory = IdFactory.attach(ID_FACTORY_ADDRESS)
  const gateway = Gateway.attach(GATEWAY_ADDRESS)

  console.log(
    "Registering TREXFactory as token factory in IdFactory through Gateway..."
  )

  // Encode the addTokenFactory function call
  const encodedCall = idFactory.interface.encodeFunctionData(
    "addTokenFactory",
    [TREX_FACTORY_ADDRESS]
  )

  // Call through the Gateway
  const tx = await gateway.callFactory(encodedCall)
  await tx.wait()

  console.log(
    `✅ Successfully registered TREXFactory (${TREX_FACTORY_ADDRESS}) as token factory`
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
