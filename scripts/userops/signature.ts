import { ethers } from "hardhat"
import dotenv from "dotenv"
dotenv.config()

async function main() {
  // --- Paste the ONCHAINID address here ---
  const onchainIdAddress = "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B"
  // --- Set the claim topic ---
  const claimTopic = 1
  // --- Set the claim data ---
  const data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("KYC passed"))

  // Get the private key from Hardhat vars
  const issuerPrivateKey = process.env.PRIVATE_KEY
  if (!issuerPrivateKey) {
    throw new Error("PRIVATE_KEY not set in .env file")
  }

  // Hash to sign
  const hash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "bytes"],
    [onchainIdAddress, claimTopic, data]
  )

  // Sign with issuer's private key
  const wallet = new ethers.Wallet(issuerPrivateKey)
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash))

  console.log("Signature:", signature)
}

main().catch(console.error)
