import { ethers } from "hardhat"

const main = async () => {
  const TREXFactory = await ethers.getContractFactory("TREXFactory")
  const trexFactory =
    await TREXFactory.deploy(/* implementation authority, idFactory, etc. */)
  await trexFactory.deployed()

  const tokenDetails = {
    name: "Spout US Corporate Bond Token", // Chosen name for the spout token
    symbol: "SUSC",
    decimals: 18,
    owner: "0x92b9baA72387Fb845D8Fe88d2a14113F9cb2C4E7", // Owner address of who can mint/burn and set compliance settings within the contract
    irAgents: [],
    tokenAgents: [],
    complianceModules: [],
    complianceSettings: [],
    ONCHAINID: "0x0000000000000000000000000000000000000000", // Set onchainID to serve different onchainIDs per token address, usefull for different entities
    irs: "0x0000000000000000000000000000000000000000",
  }

  const claimDetails = {
    claimTopics: [
      /* e.g. [1, 2, 3] */
    ],
    issuers: [
      /* addresses of trusted claim issuers */
    ],
    issuerClaims: [
      /* array of claim topics per issuer */
    ],
  }

  await trexFactory.deployTREXSuite(
    "MyTokenDeployment1",
    tokenDetails,
    claimDetails
  )
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
