const { ethers } = require("hardhat")
const dotenv = require("dotenv")

dotenv.config()

async function main() {
  // Replace with your values
  const onchainIdAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F" // ONCHAINID contract address
  const issuerAddress = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7" // Issuer address to add as claim signer key
  const claimPurpose = 3 // CLAIM
  const keyType = 1 // ECDSA

  // Get the contract instance and signer (must be a management key)
  // Get the user's private key from .env
  const userPrivateKey = process.env.PRIVATE_KEY_CUSTOMER
  if (!userPrivateKey) {
    throw new Error("PRIVATE_KEY_CUSTOMER not set in .env")
  }

  // Create a signer for the user
  const provider = ethers.provider
  const userSigner = new ethers.Wallet(userPrivateKey, provider)
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    onchainIdAddress,
    userSigner
  )

  // Compute the key (keccak256(abi.encode(address)))
  const key = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [issuerAddress])
  )

  // Add the issuer as a claim signer key
  const tx = await identity.addKey(key, claimPurpose, keyType)
  await tx.wait()
  console.log("✅ Issuer address added as claim signer key!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
