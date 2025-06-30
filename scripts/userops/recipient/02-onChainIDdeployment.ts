const { ethers } = require("hardhat")

async function main() {
  const gatewayAddress = "0xf04430Ffe6da40FE233c50909A9ebEA43dc8FDaB" // Your Gateway address
  const identityOwner = "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55" // Recipient wallet
  const salt = identityOwner // Using wallet address as salt
  const signatureExpiry = 0 // Or your chosen expiry
  const signature =
    "0x9ee40081ed3ae7dd927bea87d9bb4eebef481b7c193a2f384e958a7a405f91d65b8906b475a651dc161cb79e31df24e5cb8a0acade347c5a173dd7a52f09bbda1c"

  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["string", "address", "string", "uint256"],
    ["Authorize ONCHAINID deployment", identityOwner, salt, signatureExpiry]
  )
  const hash = ethers.utils.keccak256(encoded)

  const ethHash = ethers.utils.hashMessage(ethers.utils.arrayify(hash))

  // 2. Recover the address from the signature
  const recovered = ethers.utils.recoverAddress(ethHash, signature)

  console.log("Recovered address:", recovered)

  const [deployer] = await ethers.getSigners()
  const gateway = await ethers.getContractAt(
    "Gateway",
    gatewayAddress,
    deployer
  )

  const tx = await gateway.deployIdentityWithSalt(
    identityOwner,
    salt,
    signatureExpiry,
    signature
  )
  const receipt = await tx.wait()

  console.log("✅ ONCHAINID deployed! Tx hash:", receipt.transactionHash)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
