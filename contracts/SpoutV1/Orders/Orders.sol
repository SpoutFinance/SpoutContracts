// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionAssetConsumer} from "../Marketdata/FunctionAssetConsumer.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Orders is Ownable, FunctionAssetConsumer {
    event BuyOrderCreated(
        address indexed user,
        string ticker,
        address token,
        uint256 usdcAmount,
        uint256 assetAmount,
        uint256 price
    );
    event SellOrderCreated(
        address indexed user,
        string ticker,
        address token,
        uint256 usdcAmount,
        uint256 assetAmount,
        uint256 price
    );

    event FulFillSellOrderUSDCWithdraw(address indexed user, uint256 amount);

    // Store pending orders
    struct PendingBuyOrder {
        address user;
        string ticker;
        address token;
        uint256 usdcAmount;
        address orderAddr;
    }
    mapping(bytes32 => PendingBuyOrder) public pendingBuyOrders;

    // Store pending sell orders
    struct PendingSellOrder {
        address user;
        string ticker;
        address token;
        uint256 tokenAmount;
        address orderAddr;
    }
    mapping(bytes32 => PendingSellOrder) public pendingSellOrders;

    address public immutable agent;
    IERC20 public immutable usdcToken;

    constructor(address _owner, address _agent, address _usdc) {
        _transferOwnership(_owner);
        agent = _agent;
        usdcToken = IERC20(_usdc);
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "Only agent can call this function");
        _;
    }

    // Buy asset with USDC, requesting price from oracle
    // orderAddr is the address to receive the callback
    function buyAsset(
        string memory asset,
        string memory ticker,
        address token,
        uint256 usdcAmount,
        uint64 subscriptionId,
        address orderAddr // address calling buyAsset() function
    ) public {
        // Transfer USDC from user to contract
        usdcToken.transferFrom(msg.sender, address(this), usdcAmount);

        // Request price from inherited FunctionAssetConsumer
        bytes32 requestId = getAssetPrice(asset, subscriptionId);

        // Store pending order with callback address
        pendingBuyOrders[requestId] = PendingBuyOrder(
            msg.sender,
            ticker,
            token,
            usdcAmount,
            orderAddr
        );
    }

    // Sell asset for USDC, requesting price from oracle
    // orderAddr is the address to receive the callback (usually msg.sender, or another contract)
    function sellAsset(
        string memory asset,
        string memory ticker,
        address token,
        uint256 tokenAmount,
        uint64 subscriptionId,
        address orderAddr // address calling buyAsset() function
    ) public {
        // Request price from inherited FunctionAssetConsumer
        bytes32 requestId = getAssetPrice(asset, subscriptionId);

        pendingSellOrders[requestId] = PendingSellOrder(
            msg.sender,
            ticker,
            token,
            tokenAmount,
            orderAddr
        );
    }

    // This function is called by the contract itself as a callback
    function fulfillBuyOrder(bytes32 requestId, uint256 price) public {
        PendingBuyOrder memory order = pendingBuyOrders[requestId];
        require(order.user != address(0), "Order not found");
        require(price > 0, "Price not fulfilled yet");

        // Calculate asset amount (adjust decimals as needed)
        uint256 assetAmount = (order.usdcAmount * 1e18) / price;

        // Emit event
        emit BuyOrderCreated(
            order.user,
            order.ticker,
            order.token,
            order.usdcAmount,
            assetAmount,
            price
        );

        // Clean up
        delete pendingBuyOrders[requestId];
    }

    // This function is called by the contract itself
    function fulfillSellOrder(bytes32 requestId, uint256 price) public {
        PendingSellOrder memory order = pendingSellOrders[requestId];
        require(order.user != address(0), "Sell order not found");
        require(price > 0, "Price not fulfilled yet");

        // Calculate USDC amount (adjust decimals as needed)
        uint256 usdcAmount = (order.tokenAmount * price) / 1e18;

        // Emit event
        emit SellOrderCreated(
            order.user,
            order.ticker,
            order.token,
            usdcAmount,
            order.tokenAmount,
            price
        );

        // Clean up
        delete pendingSellOrders[requestId];
    }

    function withdrawUSDC(uint256 amount) public onlyAgent {
        usdcToken.transfer(msg.sender, amount);
        emit FulFillSellOrderUSDCWithdraw(msg.sender, amount);
    }

    // Override fulfillRequest to call the callback for buy or sell orders
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal virtual override {
        string memory asset = requestIdToAsset[requestId];
        if (bytes(asset).length == 0) {
            revert UnexpectedRequestID(requestId);
        }
        requestIdToResponse[requestId] = response;
        requestIdToError[requestId] = err;
        uint256 price = abi.decode(response, (uint256));
        assetToPrice[asset] = price;
        emit Response(requestId, asset, price, response, err);
        // Only emit events for buy or sell orders stored in this contract
        PendingBuyOrder memory buyOrder = pendingBuyOrders[requestId];
        if (buyOrder.orderAddr != address(0)) {
            fulfillBuyOrder(requestId, price);
        } else {
            PendingSellOrder memory sellOrder = pendingSellOrders[requestId];
            if (sellOrder.orderAddr != address(0)) {
                fulfillSellOrder(requestId, price);
            }
        }
    }
}
