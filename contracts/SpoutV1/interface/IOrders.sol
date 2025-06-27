// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IOrders {
    event BuyOrderCreated(
        address indexed user,
        address token,
        uint256 usdcAmount,
        uint256 assetAmount,
        uint256 price
    );
    event SellOrderCreated(address token, uint256 amount, uint256 price);

    function buyAsset(
        string memory asset,
        address token,
        uint256 usdcAmount,
        uint64 subscriptionId,
        address orderAddr
    ) external;

    function sellAsset(
        string memory asset,
        address token,
        uint256 tokenAmount,
        uint64 subscriptionId,
        address orderAddr
    ) external;

    function fulfillBuyOrder(bytes32 requestId, uint256 price) external;

    function fulfillSellOrder(bytes32 requestId, uint256 price) external;
}
