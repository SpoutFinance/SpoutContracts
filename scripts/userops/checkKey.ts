const { ethers } = require("hardhat")

// Replace with your issuer's ONCHAINID and the address you want to check
const issuerOnchainIdAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"
const addressToCheck = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"
const claimPurpose = 3

async function main() {
  const [signer] = await ethers.getSigners()
  const identity = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/Identity.sol:Identity",
    issuerOnchainIdAddress,
    signer
  )

  // Hash the address as ONCHAINID expects
  const key = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [addressToCheck])
  )

  const hasPurpose = await identity.keyHasPurpose(key, claimPurpose)
  console.log(
    `Address ${addressToCheck} is${
      hasPurpose ? "" : " NOT"
    } a claim signer key (purpose 3) on ONCHAINID ${issuerOnchainIdAddress}`
  )
}

main().catch(console.error)
