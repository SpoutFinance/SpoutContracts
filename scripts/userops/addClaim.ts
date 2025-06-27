const { ethers } = require("hardhat")

async function main() {
  const onchainIdAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"
  const claimIssuer = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"
  const topic = 1
  const scheme = 1
  const signature =
    "0x045746aa24d24a214eeef33f3236c6fd06ab94699352c4f060e128d433776b61754947567f847b21a3c45ce9f6f046244f26ff6622d0b87f55c9a7e312e5092b1b" // Output from claimSignature.ts
  const data =
    "0x06fdd523c9e64db4a7a67716a6b20d5da5ce39e3ee59b2ca281248b18087e860" // Look at claimSignature.ts to get hashed data
  const uri = ""

  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    onchainIdAddress
  )

  const tx = await identity.addClaim(
    topic,
    scheme,
    claimIssuer,
    signature,
    data,
    uri
  )
  await tx.wait()
  console.log("✅ KYC claim added to ONCHAINID!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
