// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IFunctionAssetConsumer} from "../Marketdata/IFunctionAssetConsumer.sol";

contract Orders is Ownable {
    event BuyOrderCreated(
        address indexed user,
        address token,
        uint256 usdcAmount,
        uint256 assetAmount,
        uint256 price
    );
    event SellOrderCreated(address token, uint256 amount, uint256 price);

    IFunctionAssetConsumer public oracle;

    // Store pending orders
    struct PendingOrder {
        address user;
        address token;
        uint256 usdcAmount;
    }
    mapping(bytes32 => PendingOrder) public pendingOrders;

    constructor(address oracleAddress) {
        oracle = IFunctionAssetConsumer(oracleAddress);
    }

    function createOrder(address token, uint256 amount, uint256 price) public {
        // TODO: Implement order creation
    }

    // Buy asset with USDC, requesting price from oracle
    function buyAsset(
        string memory asset,
        address token,
        uint256 usdcAmount,
        uint64 subscriptionId
    ) public {
        // TODO: Transfer USDC from user to contract (add checks/approvals as needed)
        // IERC20(token).transferFrom(msg.sender, address(this), usdcAmount);

        // Request price from oracle
        bytes32 requestId = oracle.getAssetPrice(asset, subscriptionId);

        // Store pending order
        pendingOrders[requestId] = PendingOrder(msg.sender, token, usdcAmount);
    }

    // Fulfill buy order after oracle returns price
    function fulfillBuyOrder(bytes32 requestId, uint256 price) external {
        require(msg.sender == address(oracle), "Only oracle can fulfill");
        PendingOrder memory order = pendingOrders[requestId];
        require(order.user != address(0), "Order not found");

        // Calculate asset amount (adjust decimals as needed)
        uint256 assetAmount = (order.usdcAmount * 1e18) / price;

        // Emit event
        emit BuyOrderCreated(
            order.user,
            order.token,
            order.usdcAmount,
            assetAmount,
            price
        );

        // Clean up
        delete pendingOrders[requestId];
    }
}
