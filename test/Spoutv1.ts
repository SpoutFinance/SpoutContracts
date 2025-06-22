import { expect } from "chai"
import { ethers } from "hardhat"
import { Contract, ContractFactory, Signer } from "ethers"

describe("Spout RWA Token", function () {
  let SpoutToken: ContractFactory
  let spoutToken: Contract
  let FunctionAssetConsumer: ContractFactory
  let marketDataConsumer: Contract
  let owner: Signer
  let addr1: Signer
  let addr2: Signer
  let ownerAddress: string
  let addr1Address: string
  let addr2Address: string

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners()
    ownerAddress = await owner.getAddress()
    addr1Address = await addr1.getAddress()
    addr2Address = await addr2.getAddress()

    // Deploy market data consumer
    FunctionAssetConsumer = await ethers.getContractFactory("FunctionAssetConsumer")
    marketDataConsumer = await FunctionAssetConsumer.deploy()
    await marketDataConsumer.deployed()

    // Deploy Spout token
    SpoutToken = await ethers.getContractFactory("Spoutv1")
    spoutToken = await SpoutToken.deploy()
    await spoutToken.deployed()
  })

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await spoutToken.owner()).to.equal(ownerAddress)
    })

    it("Should start with zero total supply", async function () {
      expect(await spoutToken.totalSupply()).to.equal(0)
    })
  })

  describe("RWA Initialization", function () {
    it("Should initialize RWA parameters correctly", async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60 // 1 year from now
      const couponRate = 500 // 5%

      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)

      expect(await spoutToken.maturityDate()).to.equal(maturityDate)
      expect(await spoutToken.couponRate()).to.equal(couponRate)
      expect(await spoutToken.marketDataConsumer()).to.equal(marketDataConsumer.address)
    })

    it("Should revert if maturity date is in the past", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 24 * 60 * 60 // 1 day ago
      const couponRate = 500

      await expect(
        spoutToken.initializeRWA(pastDate, couponRate, marketDataConsumer.address)
      ).to.be.revertedWith("Maturity date must be in the future")
    })

    it("Should revert if coupon rate exceeds 100%", async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const invalidCouponRate = 10001 // 100.01%

      await expect(
        spoutToken.initializeRWA(maturityDate, invalidCouponRate, marketDataConsumer.address)
      ).to.be.revertedWith("Coupon rate cannot exceed 100%")
    })
  })

  describe("Interest Calculation", function () {
    beforeEach(async function () {
      // Initialize RWA parameters
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500 // 5%
      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)

      // Mint some tokens to addr1
      const amount = ethers.utils.parseUnits("1000", 6)
      await spoutToken.mint(addr1Address, amount)
    })

    it("Should calculate interest correctly", async function () {
      // Wait some time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]) // 30 days
      await ethers.provider.send("evm_mine", [])

      const interest = await spoutToken.calculateInterest(addr1Address)
      expect(interest).to.be.gt(0)
    })

    it("Should return zero interest for zero balance", async function () {
      const interest = await spoutToken.calculateInterest(addr2Address)
      expect(interest).to.equal(0)
    })

    it("Should release interest correctly", async function () {
      const initialBalance = await spoutToken.balanceOf(addr1Address)
      
      // Wait some time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]) // 30 days
      await ethers.provider.send("evm_mine", [])

      await spoutToken.interestRelease(addr1Address)
      
      const finalBalance = await spoutToken.balanceOf(addr1Address)
      expect(finalBalance).to.be.gt(initialBalance)
    })
  })

  describe("Bond Status", function () {
    beforeEach(async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500
      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)
    })

    it("Should return correct maturity status", async function () {
      expect(await spoutToken.isMatured()).to.be.false
      
      // Fast forward past maturity
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60]) // 366 days
      await ethers.provider.send("evm_mine", [])
      
      expect(await spoutToken.isMatured()).to.be.true
    })

    it("Should return correct time until maturity", async function () {
      const timeUntilMaturity = await spoutToken.timeUntilMaturity()
      expect(timeUntilMaturity).to.be.gt(0)
    })

    it("Should return zero time until maturity when matured", async function () {
      // Fast forward past maturity
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60])
      await ethers.provider.send("evm_mine", [])
      
      expect(await spoutToken.timeUntilMaturity()).to.equal(0)
    })
  })

  describe("RWA Transfer Validation", function () {
    beforeEach(async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500
      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)
    })

    it("Should validate transfers correctly", async function () {
      const isValid = await spoutToken.validateRWATransfer(addr1Address, addr2Address, ethers.utils.parseUnits("1000", 6))
      expect(isValid).to.be.true
    })

    it("Should reject transfers after maturity", async function () {
      // Fast forward past maturity
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60])
      await ethers.provider.send("evm_mine", [])
      
      const isValid = await spoutToken.validateRWATransfer(addr1Address, addr2Address, ethers.utils.parseUnits("1000", 6))
      expect(isValid).to.be.false
    })

    it("Should reject transfers below minimum amount", async function () {
      const isValid = await spoutToken.validateRWATransfer(addr1Address, addr2Address, 500) // Below 1000 minimum
      expect(isValid).to.be.false
    })
  })

  describe("Batch Operations", function () {
    beforeEach(async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500
      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)

      // Mint tokens to multiple addresses
      await spoutToken.mint(addr1Address, ethers.utils.parseUnits("1000", 6))
      await spoutToken.mint(addr2Address, ethers.utils.parseUnits("1000", 6))
    })

    it("Should perform batch interest release", async function () {
      // Wait some time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60])
      await ethers.provider.send("evm_mine", [])

      const initialBalance1 = await spoutToken.balanceOf(addr1Address)
      const initialBalance2 = await spoutToken.balanceOf(addr2Address)

      await spoutToken.batchInterestRelease([addr1Address, addr2Address])

      const finalBalance1 = await spoutToken.balanceOf(addr1Address)
      const finalBalance2 = await spoutToken.balanceOf(addr2Address)

      expect(finalBalance1).to.be.gt(initialBalance1)
      expect(finalBalance2).to.be.gt(initialBalance2)
    })
  })

  describe("Bond Information", function () {
    beforeEach(async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500
      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)
    })

    it("Should return correct bond information", async function () {
      const bondInfo = await spoutToken.getBondInfo()
      
      expect(bondInfo._maturityDate).to.be.gt(0)
      expect(bondInfo._couponRate).to.equal(500)
      expect(bondInfo._isMatured).to.be.false
      expect(bondInfo._timeUntilMaturity).to.be.gt(0)
    })
  })

  describe("Market Data Integration", function () {
    it("Should allow setting market data consumer", async function () {
      const newConsumer = addr1Address
      await spoutToken.setMarketDataConsumer(newConsumer)
      expect(await spoutToken.marketDataConsumer()).to.equal(newConsumer)
    })

    it("Should revert setting market data consumer to zero address", async function () {
      await expect(
        spoutToken.setMarketDataConsumer(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid address")
    })
  })

  describe("Access Control", function () {
    it("Should only allow owner to initialize RWA", async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500

      await expect(
        spoutToken.connect(addr1).initializeRWA(maturityDate, couponRate, marketDataConsumer.address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should only allow owner to release interest", async function () {
      await expect(
        spoutToken.connect(addr1).interestRelease(addr1Address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should only allow owner to set market data consumer", async function () {
      await expect(
        spoutToken.connect(addr1).setMarketDataConsumer(addr1Address)
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("Should only allow owner to perform batch operations", async function () {
      await expect(
        spoutToken.connect(addr1).batchInterestRelease([addr1Address])
      ).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe("Events", function () {
    it("Should emit events on RWA initialization", async function () {
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500

      await expect(spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address))
        .to.emit(spoutToken, "MaturityDateSet")
        .withArgs(maturityDate)
        .and.to.emit(spoutToken, "CouponRateSet")
        .withArgs(couponRate)
        .and.to.emit(spoutToken, "MarketDataConsumerSet")
        .withArgs(marketDataConsumer.address)
    })

    it("Should emit events on interest release", async function () {
      // Initialize and mint tokens
      const maturityDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
      const couponRate = 500
      await spoutToken.initializeRWA(maturityDate, couponRate, marketDataConsumer.address)
      await spoutToken.mint(addr1Address, ethers.utils.parseUnits("1000", 6))

      // Wait some time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60])
      await ethers.provider.send("evm_mine", [])

      await expect(spoutToken.interestRelease(addr1Address))
        .to.emit(spoutToken, "InterestReleased")
        .withArgs(addr1Address, ethers.BigNumber.from(0).gt(0), ethers.BigNumber.from(0).gt(0))
    })
  })
})
