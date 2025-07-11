const { ethers } = require("hardhat")

const claimIssuerAddress = "0xfBbB54Ea804cC2570EeAba2fea09d0c66582498F"
const recoveredAddress = "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7"

// Add candidate addresses to check
const candidateAddresses = [
  "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7", // The deployer we're checking
  "0x23EBeA62B3dB762475Db41Dc41eDa7e2021e1C55", // From other scripts
  "0xb04eAce0e3D886Bc514e84Ed42a7C43FC2183536", // IdFactory address
  "0x369B11fb8C65d02b3BdD68b922e8f0D6FDB58717", // From issuer scripts
  "0x8b29471B993DD9854FDd80b6243f76Fc4a03E6e7", // From customer scripts
  "0x2eC77FDcb56370A3C0aDa518DDe86D820d76743B", // OnchainID from scripts
  "0xf5fF3Dc42fa5a6E3deb85cA1b9036B800462973c", // Another OnchainID
  // Add the zero address just in case
  "0x0000000000000000000000000000000000000000",
]

async function main() {
  // Get the contract instance using Hardhat's ethers, by contract name
  const contract = await ethers.getContractAt(
    "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer",
    claimIssuerAddress
  )

  // Hash the address as required by the contract
  const key = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [recoveredAddress])
  )

  // Query the purposes
  const purposes = await contract.getKeyPurposes(key)
  console.log("Purposes for key:", purposes)

  // Get management keys
  console.log("\n--- Checking for management keys ---")
  const managementKeys = await contract.getKeysByPurpose(1)
  console.log("Management keys (purpose 1):", managementKeys)

  if (managementKeys.length > 0) {
    console.log(
      "\n🔍 Checking candidate addresses to find management key owner..."
    )

    for (let mgmtKey of managementKeys) {
      console.log(`\nManagement key: ${mgmtKey}`)

      let found = false
      for (let candidate of candidateAddresses) {
        const candidateHash = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(["address"], [candidate])
        )

        if (candidateHash === mgmtKey) {
          console.log(`  ✅ FOUND! This is the hash of address: ${candidate}`)
          found = true
          break
        }
      }

      if (!found) {
        console.log(`  ❌ Management address not found in candidate list`)
        console.log(
          `     To find it, you need an address where: keccak256(abi.encode(address)) === ${mgmtKey}`
        )

        // Try to get the deployer from hardhat signers to check if it matches
        try {
          const [deployer] = await ethers.getSigners()
          const deployerHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(["address"], [deployer.address])
          )

          if (deployerHash === mgmtKey) {
            console.log(
              `  ✅ FOUND! This is the current deployer/signer: ${deployer.address}`
            )
            found = true
          } else {
            console.log(
              `  ℹ️  Current signer (${deployer.address}) is NOT the management key`
            )
          }
        } catch (e) {
          console.log(`  ⚠️  Could not check current signer: ${e.message}`)
        }
      }
    }
  }

  const numericPurposes = purposes.map((p) => Number(p))
  const hasClaimKey = numericPurposes.includes(3)
  const hasManagementKey = numericPurposes.includes(1)

  console.log("\n--- Analysis for your address ---")
  if (hasClaimKey && hasManagementKey) {
    console.log(
      "Recovered address IS BOTH a MANAGEMENT (1) and CLAIM (3) key on the ClaimIssuer contract."
    )
  } else if (hasClaimKey) {
    console.log(
      "Recovered address IS a CLAIM (3) key on the ClaimIssuer contract."
    )
  } else if (hasManagementKey) {
    console.log(
      "Recovered address IS a MANAGEMENT (1) key on the ClaimIssuer contract."
    )
  } else {
    console.log(
      "Recovered address is NOT a MANAGEMENT (1) or CLAIM (3) key on the ClaimIssuer contract."
    )
  }
}

main()

export {}
