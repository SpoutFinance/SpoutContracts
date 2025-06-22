import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                       PASTE YOUR ADDRESSES HERE
  // --------------------------------------------------------------------------------------------
  const TREX_IA_ADDRESS = "0xBD456121D833e3d29Ef83c86f8dc57c97630878A" // The address from script 04

  const TOKEN_LOGIC_ADDRESS = "0x5De6e7cAE4b30d4CbF744B6Dd78c6418F5750570" // The address from script 01
  const COMPLIANCE_LOGIC_ADDRESS = "0xCAdaFeDf40140C8eBCa3A0E802dfC4dD72869c9F" // The address from script 02

  // Addresses from script 03
  const IRS_LOGIC_ADDRESS = "0xC9EbB17FC1f5101Db84EA345693194c520b411bb"
  const IR_LOGIC_ADDRESS = "0xa966bdf941ea2eccc8ADC453B977FFeE27bC2f55"
  const CTR_LOGIC_ADDRESS = "0x40edF44F3B7bD10ae4423A758f3b8c68a01efca1"
  const TIR_LOGIC_ADDRESS = "0xbeA4b5588d01CE6f400500A43815Be309A095287"
  // --------------------------------------------------------------------------------------------

  console.log(
    "Registering all logic contracts in the Implementation Authority..."
  )
  const [deployer] = await ethers.getSigners()
  console.log("Using account:", deployer.address)

  const feeData = await ethers.provider.getFeeData()
  const maxFeePerGas =
    feeData.maxFeePerGas ?? ethers.utils.parseUnits("5", "gwei")
  const maxPriorityFeePerGas =
    feeData.maxPriorityFeePerGas ?? ethers.utils.parseUnits("2", "gwei")

  const overrides = {
    maxFeePerGas: maxFeePerGas.add(ethers.utils.parseUnits("5", "gwei")),
    maxPriorityFeePerGas: maxPriorityFeePerGas.add(
      ethers.utils.parseUnits("2", "gwei")
    ),
  }

  const TREXImplementationAuthority = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/authority/TREXImplementationAuthority.sol:TREXImplementationAuthority"
  )
  const trexIA = TREXImplementationAuthority.attach(TREX_IA_ADDRESS)

  const version = { major: 1, minor: 0, patch: 0 }
  const contracts = {
    tokenImplementation: TOKEN_LOGIC_ADDRESS,
    ctrImplementation: CTR_LOGIC_ADDRESS,
    irImplementation: IR_LOGIC_ADDRESS,
    irsImplementation: IRS_LOGIC_ADDRESS,
    tirImplementation: TIR_LOGIC_ADDRESS,
    mcImplementation: COMPLIANCE_LOGIC_ADDRESS,
  }

  console.log("\nRegistering implementations as Version 1.0.0...")
  const tx = await trexIA.addAndUseTREXVersion(version, contracts, overrides)
  await tx.wait()

  console.log("\nVerifying the implementation address was set correctly...")
  const tokenImplementation = await trexIA.getTokenImplementation()
  console.log("Registered Token Implementation:", tokenImplementation)

  if (tokenImplementation.toLowerCase() === TOKEN_LOGIC_ADDRESS.toLowerCase()) {
    console.log("✅ Verification successful!")
  } else {
    console.error("❌ Verification failed! The address does not match.")
  }

  console.log(
    "\n✅ All logic contracts registered in TREXImplementationAuthority."
  )
  console.log("\n🚀 T-REX Infrastructure deployment complete!")
  console.log(
    "You can now use the TREXImplementationAuthority address to deploy your factories."
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment error:", error)
    process.exit(1)
  })
