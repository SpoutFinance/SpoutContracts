const { ethers } = require("hardhat")

async function main() {
  // Replace with your deployed IdFactory address
  const idFactoryAddress = "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536"
  // Replace with the wallet address you want to check
  const walletToCheck = "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55"

  const idFactory = await ethers.getContractAt("IdFactory", idFactoryAddress)

  const onchainId = await idFactory.getIdentity(walletToCheck)
  if (onchainId === ethers.constants.AddressZero) {
    console.log(`No ONCHAINID registered for ${walletToCheck}`)
  } else {
    console.log(`ONCHAINID for ${walletToCheck}: ${onchainId}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
