import { ethers } from "hardhat"

async function main() {
  const ClaimIssuer = await ethers.getContractFactory("ClaimIssuer")
  const claimIssuer = await ClaimIssuer.deploy()
  await claimIssuer.deployed()
  console.log("ClaimIssuer deployed to:", claimIssuer.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
