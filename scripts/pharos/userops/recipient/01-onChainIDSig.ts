const { ethers } = require("ethers")
import dotenv from "dotenv"
dotenv.config()

async function main() {
  // Replace with your values
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY) // Approved signer
  const identityOwner = "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55"
  const salt = identityOwner // e.g., ethers.utils.hexlify(ethers.utils.randomBytes(32))
  const signatureExpiry = 0 // or a future timestamp
  console.log("signer wallet", signer)
  console.log("Signer address:", signer.address)

  // 1. ABI-encode the data
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["string", "address", "string", "uint256"],
    ["Authorize ONCHAINID deployment", identityOwner, salt, signatureExpiry]
  )

  // 2. Hash the encoded data
  const hash = ethers.utils.keccak256(encoded)

  // 3. Apply the Ethereum message prefix (same as .toEthSignedMessageHash())
  const ethHash = ethers.utils.hashMessage(ethers.utils.arrayify(hash))

  // 4. Sign the hash directly (no extra prefixing)
  const signatureObj = signer._signingKey().signDigest(ethHash)
  const signature = ethers.utils.joinSignature(signatureObj)
  console.log("Signature:", signature)

  // 5. Recover the address for verification
  const recovered = ethers.utils.recoverAddress(ethHash, signature)
  console.log("Recovered address:", recovered)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
