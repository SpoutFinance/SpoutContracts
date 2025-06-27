// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionAssetConsumer} from "../Marketdata/FunctionAssetConsumer.sol";
import {IOrdersReceiver} from "../interface/IOrdersReceiver.sol";

contract Orders is Ownable, FunctionAssetConsumer, IOrdersReceiver {
    event BuyOrderCreated(
        address indexed user,
        address token,
        uint256 usdcAmount,
        uint256 assetAmount,
        uint256 price
    );
    event SellOrderCreated(address token, uint256 amount, uint256 price);

    // Store pending orders
    struct PendingOrder {
        address user;
        address token;
        uint256 usdcAmount;
        address orderAddr; // callback receiver
    }
    mapping(bytes32 => PendingOrder) public pendingOrders;

    // Store pending sell orders
    struct PendingSellOrder {
        address user;
        address token;
        uint256 tokenAmount;
        address orderAddr; // callback receiver
    }
    mapping(bytes32 => PendingSellOrder) public pendingSellOrders;

    // Buy asset with USDC, requesting price from oracle
    // orderAddr is the address to receive the callback (usually msg.sender, or another contract)
    function buyAsset(
        string memory asset,
        address token,
        uint256 usdcAmount,
        uint64 subscriptionId,
        address orderAddr
    ) public {
        // TODO: Transfer USDC from user to contract (add checks/approvals as needed)
        // IERC20(token).transferFrom(msg.sender, address(this), usdcAmount);

        // Request price from inherited FunctionAssetConsumer
        bytes32 requestId = getAssetPrice(asset, subscriptionId);

        // Store pending order with callback address
        pendingOrders[requestId] = PendingOrder(
            msg.sender,
            token,
            usdcAmount,
            orderAddr
        );
    }

    // Sell asset for USDC, requesting price from oracle
    // orderAddr is the address to receive the callback (usually msg.sender, or another contract)
    function sellAsset(
        string memory asset,
        address token,
        uint256 tokenAmount,
        uint64 subscriptionId,
        address orderAddr
    ) public {
        // TODO: Transfer tokens from user to contract (add checks/approvals as needed)
        // IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        // Request price from inherited FunctionAssetConsumer
        bytes32 requestId = getAssetPrice(asset, subscriptionId);

        // Store pending sell order with callback address
        pendingSellOrders[requestId] = PendingSellOrder(
            msg.sender,
            token,
            tokenAmount,
            orderAddr
        );
    }

    // This function is called by the contract itself or by the callback receiver
    function fulfillBuyOrder(bytes32 requestId, uint256 price) public override {
        PendingOrder memory order = pendingOrders[requestId];
        require(order.user != address(0), "Order not found");
        require(price > 0, "Price not fulfilled yet");

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

    // This function is called by the contract itself or by the callback receiver for sell orders
    function fulfillSellOrder(bytes32 requestId, uint256 price) public {
        PendingSellOrder memory order = pendingSellOrders[requestId];
        require(order.user != address(0), "Sell order not found");
        require(price > 0, "Price not fulfilled yet");

        // Calculate USDC amount (adjust decimals as needed)
        uint256 usdcAmount = (order.tokenAmount * price) / 1e18;

        // Emit event
        emit SellOrderCreated(order.token, order.tokenAmount, price);

        // Clean up
        delete pendingSellOrders[requestId];
    }

    // Override fulfillRequest to call the callback receiver for buy or sell orders
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        string memory asset = requestIdToAsset[requestId];
        if (bytes(asset).length == 0) {
            revert UnexpectedRequestID(requestId);
        }
        requestIdToResponse[requestId] = response;
        requestIdToError[requestId] = err;
        uint256 price = abi.decode(response, (uint256));
        assetToPrice[asset] = price;
        emit Response(requestId, asset, price, response, err);
        // Call the callback receiver if set for buy or sell order
        PendingOrder memory buyOrder = pendingOrders[requestId];
        if (buyOrder.orderAddr != address(0)) {
            IOrdersReceiver(buyOrder.orderAddr).fulfillBuyOrder(
                requestId,
                price
            );
        } else {
            PendingSellOrder memory sellOrder = pendingSellOrders[requestId];
            if (sellOrder.orderAddr != address(0)) {
                // Call fulfillSellOrder directly (no interface needed since it's in this contract)
                fulfillSellOrder(requestId, price);
            }
        }
    }
}
