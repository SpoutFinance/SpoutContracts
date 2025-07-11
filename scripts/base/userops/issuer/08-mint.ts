import { ethers } from "hardhat"

async function main() {
  // --- Paste your deployed token proxy address here ---
  const tokenProxyAddress = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB" // <-- Replace if needed
  // --- Paste the recipient address here (must be KYC/verified) ---
  const recipient = "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717" // <-- Replace with recipient address
  // --- Set the amount to mint (in token's smallest unit, e.g., 1000000 for 1 token with 6 decimals) ---
  const amount = ethers.utils.parseUnits("1000", 6) // <-- Replace 6 with your token's decimals if different

  const [signer] = await ethers.getSigners()
  console.log("Using agent:", signer.address)

  // Get the contract instance at the proxy address, using the Token ABI
  const Token = await ethers.getContractFactory(
    "contracts/ERC3643/token/Token.sol:Token"
  )
  const token = Token.attach(tokenProxyAddress).connect(signer)

  // Call mint (the signer must be an agent)
  const tx = await token.mint(recipient, amount)
  await tx.wait()

  console.log(`✅ Minted ${amount.toString()} tokens to ${recipient}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
