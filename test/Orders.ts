const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Orders", function () {
  let Orders, orders, owner, user, mockFunctionAssetConsumer
  const asset = "LQD"
  const token = "0xB5F83286a6F8590B4d01eC67c885252Ec5d0bdDB" // mock token address
  const usdcAmount = ethers.utils.parseUnits("100", 6) // 100 USDC
  const tokenAmount = ethers.utils.parseUnits("10", 18) // 10 tokens
  const price = ethers.utils.parseUnits("200", 2) // e.g., $200.00 (scaled by 100)
  const subscriptionId = 1

  beforeEach(async function () {
    ;[owner, user] = await ethers.getSigners()
    const TestOrders = await ethers.getContractFactory("TestOrders")
    orders = await TestOrders.deploy()
    await orders.deployed()
    const MockFunctionAssetConsumer = await ethers.getContractFactory(
      "MockFunctionAssetConsumer"
    )
    mockFunctionAssetConsumer = await MockFunctionAssetConsumer.deploy()
    await mockFunctionAssetConsumer.deployed()
  })

  it("should process a buy order and emit event", async function () {
    const requestId = ethers.utils.formatBytes32String("buy1")
    await mockFunctionAssetConsumer.setNextRequestId(requestId)
    const tx = await orders.connect(user).buyAsset(
      asset,
      token,
      usdcAmount,
      subscriptionId,
      user.address // orderAddr, not used in logic
    )
    const receipt = await tx.wait()
    console.log("the transaction receipt:", receipt)
    // 2. Get requestId from logs (simulate as first mapping key)
    const requestIdFromLogs = await orders.requestIdToAsset(
      Object.keys(await orders.pendingBuyOrders())[0]
    )
    // 3. Simulate Chainlink fulfillment
    await expect(
      orders
        .connect(owner)
        .fulfillRequest(
          requestIdFromLogs,
          ethers.utils.defaultAbiCoder.encode(["uint256"], [price]),
          "0x"
        )
    ).to.emit(orders, "BuyOrderCreated")
    // 4. Check order is deleted
    const order = await orders.pendingBuyOrders(requestIdFromLogs)
    expect(order.user).to.equal(ethers.constants.AddressZero)
  })

  it("should process a sell order and emit event", async function () {
    const requestId = ethers.utils.formatBytes32String("sell1")
    await mockFunctionAssetConsumer.setNextRequestId(requestId)
    const tx = await orders.connect(user).sellAsset(
      asset,
      token,
      tokenAmount,
      subscriptionId,
      user.address // orderAddr, not used in logic
    )
    const receipt = await tx.wait()
    // 2. Get requestId from logs (simulate as first mapping key)
    const requestIdFromLogs = await orders.requestIdToAsset(
      Object.keys(await orders.pendingSellOrders())[0]
    )
    // 3. Simulate Chainlink fulfillment
    await expect(
      orders
        .connect(owner)
        .fulfillRequest(
          requestIdFromLogs,
          ethers.utils.defaultAbiCoder.encode(["uint256"], [price]),
          "0x"
        )
    ).to.emit(orders, "SellOrderCreated")
    // 4. Check order is deleted
    const order = await orders.pendingSellOrders(requestIdFromLogs)
    expect(order.user).to.equal(ethers.constants.AddressZero)
  })
})
