import { ethers } from "hardhat"

async function main() {
  // --------------------------------------------------------------------------------------------
  //                                   VERIFICATION SCRIPT
  // --------------------------------------------------------------------------------------------
  const TREX_IA_ADDRESS = "0xBD456121D833e3d29Ef83c86f8dc57c97630878A" // The address from script 04
  // --------------------------------------------------------------------------------------------

  console.log(
    "Verifying registered logic contracts in the Implementation Authority..."
  )
  console.log("Using IA Address:", TREX_IA_ADDRESS)

  const TREXImplementationAuthority = await ethers.getContractFactory(
    "contracts/ERC3643/proxy/authority/TREXImplementationAuthority.sol:TREXImplementationAuthority"
  )
  const trexIA = TREXImplementationAuthority.attach(TREX_IA_ADDRESS)

  console.log(
    "\nFetching current implementation addresses for the active version..."
  )

  const tokenImplementation = await trexIA.getTokenImplementation()
  console.log("  -> Token:", tokenImplementation)

  const complianceImplementation = await trexIA.getMCImplementation()
  console.log("  -> ModularCompliance:", complianceImplementation)

  const irsImplementation = await trexIA.getIRSImplementation()
  console.log("  -> IdentityRegistryStorage:", irsImplementation)

  const irImplementation = await trexIA.getIRImplementation()
  console.log("  -> IdentityRegistry:", irImplementation)

  const ctrImplementation = await trexIA.getCTRImplementation()
  console.log("  -> ClaimTopicsRegistry:", ctrImplementation)

  const tirImplementation = await trexIA.getTIRImplementation()
  console.log("  -> TrustedIssuersRegistry:", tirImplementation)

  console.log("\n✅ Verification complete.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification error:", error)
    process.exit(1)
  })
