const { ethers } = require("hardhat")
const dotenv = require("dotenv")

dotenv.config()

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deploying ClaimIssuer from:", deployer.address)

  // Deploy ClaimIssuer contract with deployer as initial management key
  const ClaimIssuer = await ethers.getContractFactory("ClaimIssuer")
  const claimIssuer = await ClaimIssuer.deploy(deployer.address)
  await claimIssuer.deployed()

  console.log("✅ ClaimIssuer deployed at:", claimIssuer.address)
  console.log("Management key (owner):", deployer.address)

  // Check what purposes the deployer already has
  const deployerKey = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address"], [deployer.address])
  )

  const keyData = await claimIssuer.getKey(deployerKey)
  const purposes = keyData.purposes.map((p) => p.toString())
  console.log("🔍 Deployer key purposes:", purposes)

  const hasManagementKey = await claimIssuer.keyHasPurpose(deployerKey, 1)
  const hasClaimKey = await claimIssuer.keyHasPurpose(deployerKey, 3)

  console.log("👑 Has management key (purpose 1):", hasManagementKey)
  console.log("🔑 Has claim key (purpose 3):", hasClaimKey)

  if (!hasClaimKey) {
    console.log("🔄 Adding deployer as claim signer key...")
    const addKeyTx = await claimIssuer.addKey(deployerKey, 3, 1)
    await addKeyTx.wait()
    console.log("✅ Deployer added as claim signer key")
  } else {
    console.log("✅ Deployer already has claim signer key - perfect!")
  }

  // Final verification
  const finalHasClaimKey = await claimIssuer.keyHasPurpose(deployerKey, 3)
  console.log(
    "✅ Final verification - deployer has claim key:",
    finalHasClaimKey
  )

  console.log("\n🎉 ClaimIssuer is ready to use!")
  console.log("📋 ClaimIssuer Address:", claimIssuer.address)
  console.log("📋 Use this address in:")
  console.log("   1. Update TrustedIssuersRegistry")
  console.log("   2. Your addClaim calls as the issuer")

  console.log("\n🔧 Next step: Update update-trusted-issuer.ts with:")
  console.log(`   const newClaimIssuerAddress = "${claimIssuer.address}"`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
