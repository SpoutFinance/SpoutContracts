const { expect } = require("chai")

describe("AddClaim Functionality", function () {
  let ethers: any
  let deployer: any
  let customer: any
  let claimIssuer: any
  let identity: any
  let claimIssuerContract: any
  let recipientOnchainID: string
  let claimIssuerAddress: string

  const topic = 1
  const scheme = 1

  before(async function () {
    ethers = require("hardhat").ethers
    ;[deployer, customer, claimIssuer] = await ethers.getSigners()
  })

  beforeEach(async function () {
    // Deploy a test OnchainID for the customer
    const IdentityFactory = await ethers.getContractFactory(
      "contracts/Onchain-ID/contracts/Identity.sol:Identity"
    )
    identity = await IdentityFactory.deploy(customer.address, false)
    await identity.deployed()
    recipientOnchainID = identity.address

    // Deploy ClaimIssuer
    const ClaimIssuerFactory = await ethers.getContractFactory(
      "contracts/Onchain-ID/contracts/ClaimIssuer.sol:ClaimIssuer"
    )
    claimIssuerContract = await ClaimIssuerFactory.deploy(claimIssuer.address)
    await claimIssuerContract.deployed()
    claimIssuerAddress = claimIssuerContract.address

    // Add claim signer key to customer's identity (purpose 3)
    const customerKeyId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(["address"], [customer.address])
    )
    await identity.connect(customer).addKey(customerKeyId, 3, 1)
  })

  describe("Claim Signature Generation", function () {
    it("should generate valid claim signature", async function () {
      const claimData = ethers.utils.toUtf8Bytes("KYC passed")

      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimData]
      )
      const dataHash = ethers.utils.keccak256(encoded)

      const signature = await claimIssuer.signMessage(
        ethers.utils.arrayify(dataHash)
      )

      expect(signature).to.be.a("string")
      expect(signature).to.have.lengthOf(132) // 0x + 64 + 64 + 2 chars
    })

    it("should create different signatures for different data", async function () {
      const claimData1 = ethers.utils.toUtf8Bytes("KYC passed")
      const claimData2 = ethers.utils.toUtf8Bytes("Different data")

      const encoded1 = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimData1]
      )
      const encoded2 = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimData2]
      )

      const dataHash1 = ethers.utils.keccak256(encoded1)
      const dataHash2 = ethers.utils.keccak256(encoded2)

      expect(dataHash1).to.not.equal(dataHash2)
    })
  })

  describe("Claim Validation", function () {
    let signature: string
    let claimData: any

    beforeEach(async function () {
      claimData = ethers.utils.toUtf8Bytes("KYC passed")

      // Hash the claim data as required by the documentation
      const claimDataHash = ethers.utils.keccak256(claimData)

      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimDataHash]
      )
      const dataHash = ethers.utils.keccak256(encoded)

      signature = await claimIssuer.signMessage(ethers.utils.arrayify(dataHash))
    })

    it("should validate correct signature from claim issuer", async function () {
      // Use the same hash that was used for signing
      const claimDataHash = ethers.utils.keccak256(claimData)

      const isValid = await claimIssuerContract.isClaimValid(
        recipientOnchainID,
        topic,
        signature,
        claimDataHash
      )

      expect(isValid).to.be.true
    })

    it("should reject signature from wrong signer", async function () {
      // Sign with deployer instead of claimIssuer
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimData]
      )
      const dataHash = ethers.utils.keccak256(encoded)

      const wrongSignature = await deployer.signMessage(
        ethers.utils.arrayify(dataHash)
      )

      const isValid = await claimIssuerContract.isClaimValid(
        recipientOnchainID,
        topic,
        wrongSignature,
        ethers.utils.hexlify(claimData)
      )

      expect(isValid).to.be.false
    })
  })

  describe("Adding Claims", function () {
    let validSignature: string
    let claimData: any

    beforeEach(async function () {
      claimData = ethers.utils.toUtf8Bytes("KYC passed")

      // Hash the claim data as required by the documentation
      const claimDataHash = ethers.utils.keccak256(claimData)

      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimDataHash]
      )
      const dataHash = ethers.utils.keccak256(encoded)

      validSignature = await claimIssuer.signMessage(
        ethers.utils.arrayify(dataHash)
      )
    })

    it("should successfully add claim with valid signature", async function () {
      const identityWithCustomer = identity.connect(customer)

      // Use the same hash that was used for signing
      const claimDataHash = ethers.utils.keccak256(claimData)

      const tx = await identityWithCustomer.addClaim(
        topic,
        scheme,
        claimIssuerAddress,
        validSignature,
        claimDataHash,
        "https://spout.finance/claims/kyc"
      )

      const receipt = await tx.wait()
      expect(receipt.status).to.equal(1)

      // Check if claim was added by retrieving it
      const claimId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [claimIssuerAddress, topic]
        )
      )

      const claim = await identity.getClaim(claimId)
      expect(claim.topic).to.equal(topic)
      expect(claim.scheme).to.equal(scheme)
      expect(claim.issuer).to.equal(claimIssuerAddress)
      expect(claim.data).to.equal(claimDataHash)
    })

    it("should fail if sender doesn't have claim signer key", async function () {
      // Try to add claim from deployer (who doesn't have purpose 3 key)
      const identityWithDeployer = identity.connect(deployer)

      // Use the same hash that was used for signing
      const claimDataHash = ethers.utils.keccak256(claimData)

      try {
        await identityWithDeployer.addClaim(
          topic,
          scheme,
          claimIssuerAddress,
          validSignature,
          claimDataHash,
          ""
        )
        expect.fail("Should have thrown an error")
      } catch (error: any) {
        expect(error.message).to.include("claim signer key")
      }
    })

    it("should fail with invalid signature", async function () {
      const identityWithCustomer = identity.connect(customer)
      const invalidSignature = "0x" + "0".repeat(130)

      // Use the same hash that was used for signing
      const claimDataHash = ethers.utils.keccak256(claimData)

      try {
        await identityWithCustomer.addClaim(
          topic,
          scheme,
          claimIssuerAddress,
          invalidSignature,
          claimDataHash,
          ""
        )
        expect.fail("Should have thrown an error")
      } catch (error: any) {
        expect(error.message).to.include("invalid claim")
      }
    })
  })

  describe("Claim Retrieval", function () {
    let claimData: any

    beforeEach(async function () {
      claimData = ethers.utils.toUtf8Bytes("KYC passed")

      // Hash the claim data as required by the documentation
      const claimDataHash = ethers.utils.keccak256(claimData)

      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimDataHash]
      )
      const dataHash = ethers.utils.keccak256(encoded)

      const signature = await claimIssuer.signMessage(
        ethers.utils.arrayify(dataHash)
      )

      const identityWithCustomer = identity.connect(customer)
      await identityWithCustomer.addClaim(
        topic,
        scheme,
        claimIssuerAddress,
        signature,
        claimDataHash,
        "test-uri"
      )
    })

    it("should retrieve claim by ID", async function () {
      const claimId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [claimIssuerAddress, topic]
        )
      )

      // Hash the claim data as required by the documentation
      const claimDataHash = ethers.utils.keccak256(claimData)

      const claim = await identity.getClaim(claimId)
      expect(claim.topic).to.equal(topic)
      expect(claim.scheme).to.equal(scheme)
      expect(claim.issuer).to.equal(claimIssuerAddress)
      expect(claim.data).to.equal(claimDataHash)
      expect(claim.uri).to.equal("test-uri")
    })

    it("should retrieve claims by topic", async function () {
      const claimIds = await identity.getClaimIdsByTopic(topic)
      expect(claimIds).to.have.lengthOf(1)

      const expectedClaimId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [claimIssuerAddress, topic]
        )
      )
      expect(claimIds[0]).to.equal(expectedClaimId)
    })

    it("should return empty array for non-existent topic", async function () {
      const claimIds = await identity.getClaimIdsByTopic(99)
      expect(claimIds).to.have.lengthOf(0)
    })
  })

  describe("Integration Scenarios", function () {
    it("should complete full flow: sign, add, verify", async function () {
      const claimData = ethers.utils.toUtf8Bytes("KYC passed")

      // Hash the claim data as required by the documentation
      const claimDataHash = ethers.utils.keccak256(claimData)

      // 1. Generate signature
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256", "bytes"],
        [recipientOnchainID, topic, claimDataHash]
      )
      const dataHash = ethers.utils.keccak256(encoded)

      const validSignature = await claimIssuer.signMessage(
        ethers.utils.arrayify(dataHash)
      )

      // 2. Validate signature
      const isValidSignature = await claimIssuerContract.isClaimValid(
        recipientOnchainID,
        topic,
        validSignature,
        claimDataHash
      )
      expect(isValidSignature).to.be.true

      // 3. Add claim
      const identityWithCustomer = identity.connect(customer)
      const tx = await identityWithCustomer.addClaim(
        topic,
        scheme,
        claimIssuerAddress,
        validSignature,
        claimDataHash,
        ""
      )
      await tx.wait()

      // 4. Verify claim exists
      const claimId = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [claimIssuerAddress, topic]
        )
      )
      const claim = await identity.getClaim(claimId)
      expect(claim.topic).to.equal(topic)
      expect(claim.issuer).to.equal(claimIssuerAddress)
    })
  })
})
