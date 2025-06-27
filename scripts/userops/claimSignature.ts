import { ethers } from "ethers"
import dotenv from "dotenv"
dotenv.config()

// Replace with your values
const PRIVATE_KEY = process.env.PRIVATE_KEY as string // Issuer's private key
const identityAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F" // ONCHAINID (Identity) contract address
const claimTopic = 1 // e.g., 1 for KYC
// Use the string 'KYC passed' as the claim data, but hash it for privacy
const claimDataHashed = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("KYC passed")
)
const claimData = ethers.utils.toUtf8Bytes("KYC passed")

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY)

  // 1. Hash the claim data (as ONCHAINID expects)
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256", "bytes"],
    [identityAddress, claimTopic, claimData]
  )
  const dataHash = ethers.utils.keccak256(encoded)

  // 2. Apply Ethereum message prefix
  const ethHash = ethers.utils.hashMessage(ethers.utils.arrayify(dataHash))

  // 3. Sign the hash
  const signatureObj = wallet._signingKey().signDigest(ethHash)
  const signature = ethers.utils.joinSignature(signatureObj)

  // 4. Recover the address from the signature and claimData
  const recovered = ethers.utils.recoverAddress(ethHash, signature)

  // Output the claim data, signature, and recovered address
  console.log("claimData (hex):", ethers.utils.hexlify(claimDataHashed))
  console.log("signature:", signature)
  console.log("recovered address:", recovered)
}

main().catch(console.error)
