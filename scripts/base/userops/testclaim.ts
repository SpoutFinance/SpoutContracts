const { ethers } = require("ethers")

// Inputs
const identity = "0xb992DB7fe0f36de2bA15FB0978D3540cd3c3389A"
const topic = 1
const claimData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("KYC passed")) // already a hash

console.log("Claim data:", claimData)

// Step 1: ABI encode and hash
const abi = ethers.utils.defaultAbiCoder
const dataHash = ethers.utils.keccak256(
  abi.encode(["address", "uint256", "bytes"], [identity, topic, claimData])
)

// Step 2: Ethereum Signed Message hash
const ethSignedMessageHash = ethers.utils.hashMessage(
  ethers.utils.arrayify(dataHash)
)

// Step 3: Recover the address
const signature =
  "0x3733343b20ad7a0f14189491147650dea2b63cf470c0b140840a06364e8671667797916251cf20529efb6f282a926ea20d3bcdd6fd567c4987f517c38fa31da71c"
const recoveredAddress = ethers.utils.recoverAddress(
  ethSignedMessageHash,
  signature
)

console.log("Recovered address:", recoveredAddress)
