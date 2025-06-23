import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                       PASTE YOUR ADDRESSES HERE
  // --------------------------------------------------------------------------------------------
  const TREX_IA_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" // The address from script 04
  // --------------------------------------------------------------------------------------------

  console.log("Checking Implementation Authority status...")
  const [deployer] = await ethers.getSigners()
  console.log("Using account:", deployer.address)

  const TREXImplementationAuthority = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/authority/TREXImplementationAuthority.sol:TREXImplementationAuthority"
  )
  const trexIA = TREXImplementationAuthority.attach(TREX_IA_ADDRESS)

  try {
    // Get current version
    const currentVersion = await trexIA.getCurrentVersion()
    console.log("\n✅ Current active version:", currentVersion)

    // Get implementation addresses
    const tokenImpl = await trexIA.getTokenImplementation()
    const ctrImpl = await trexIA.getCTRImplementation()
    const irImpl = await trexIA.getIRImplementation()
    const irsImpl = await trexIA.getIRSImplementation()
    const tirImpl = await trexIA.getTIRImplementation()
    const mcImpl = await trexIA.getMCImplementation()

    console.log("\n📋 Current implementations:")
    console.log("  Token Implementation:     ", tokenImpl)
    console.log("  CTR Implementation:       ", ctrImpl)
    console.log("  IR Implementation:        ", irImpl)
    console.log("  IRS Implementation:       ", irsImpl)
    console.log("  TIR Implementation:       ", tirImpl)
    console.log("  MC Implementation:        ", mcImpl)

    // Check if all implementations are set (not zero address)
    const implementations = [
      tokenImpl,
      ctrImpl,
      irImpl,
      irsImpl,
      tirImpl,
      mcImpl,
    ]
    const allSet = implementations.every(
      (impl) => impl !== ethers.constants.AddressZero
    )

    if (allSet) {
      console.log("\n✅ All implementations are properly set!")
      console.log(
        "🚀 Implementation Authority is ready for factory deployment!"
      )
      console.log("\n📝 Next step: Deploy TREX Factory")
      console.log(
        "   Run: npx hardhat run scripts/deployment/07-deploy-trex-factory.ts --network base-sepolia"
      )
    } else {
      console.log("\n❌ Some implementations are not set (zero address)")
      console.log("Please run the registration script to set them up.")
    }
  } catch (error) {
    console.error("❌ Error checking Implementation Authority:", error)
    console.log(
      "This might mean the Implementation Authority is not properly deployed or configured."
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
