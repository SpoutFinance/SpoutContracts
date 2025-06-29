// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IOrders
 * @dev Interface for the Orders contract - handles buy/sell orders with Chainlink price feeds
 */
interface IOrders {
    // Events
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

    // Structs
    struct PendingBuyOrder {
        address user;
        string ticker;
        address token;
        uint256 usdcAmount;
        address orderAddr;
    }

    struct PendingSellOrder {
        address user;
        string ticker;
        address token;
        uint256 tokenAmount;
        address orderAddr;
    }

    /**
     * @dev Buy asset with USDC, requesting price from oracle
     * @param asset The asset symbol to get price for
     * @param ticker The ticker symbol for the token
     * @param token The token contract address
     * @param usdcAmount Amount of USDC to spend
     * @param subscriptionId Chainlink Functions subscription ID
     * @param orderAddr Address to receive the callback
     */
    function buyAsset(
        string memory asset,
        string memory ticker,
        address token,
        uint256 usdcAmount,
        uint64 subscriptionId,
        address orderAddr
    ) external;

    /**
     * @dev Sell asset for USDC, requesting price from oracle
     * @param asset The asset symbol to get price for
     * @param ticker The ticker symbol for the token
     * @param token The token contract address
     * @param tokenAmount Amount of tokens to sell
     * @param subscriptionId Chainlink Functions subscription ID
     * @param orderAddr Address to receive the callback
     */
    function sellAsset(
        string memory asset,
        string memory ticker,
        address token,
        uint256 tokenAmount,
        uint64 subscriptionId,
        address orderAddr
    ) external;

    /**
     * @dev Fulfill a buy order (internal callback)
     * @param requestId The Chainlink request ID
     * @param price The asset price from oracle
     */
    function fulfillBuyOrder(bytes32 requestId, uint256 price) external;

    /**
     * @dev Fulfill a sell order (internal callback)
     * @param requestId The Chainlink request ID
     * @param price The asset price from oracle
     */
    function fulfillSellOrder(bytes32 requestId, uint256 price) external;

    /**
     * @dev Withdraw USDC from contract (agent only)
     * @param amount Amount of USDC to withdraw
     */
    function withdrawUSDC(uint256 amount) external;

    /**
     * @dev Get pending buy order details
     * @param requestId The request ID to check
     * @return order The pending buy order details
     */
    function pendingBuyOrders(
        bytes32 requestId
    ) external view returns (PendingBuyOrder memory order);

    /**
     * @dev Get pending sell order details
     * @param requestId The request ID to check
     * @return order The pending sell order details
     */
    function pendingSellOrders(
        bytes32 requestId
    ) external view returns (PendingSellOrder memory order);

    /**
     * @dev Get the agent address
     * @return The agent address
     */
    function agent() external view returns (address);

    /**
     * @dev Get the USDC token contract
     * @return The USDC token contract interface
     */
    function usdcToken() external view returns (address);

    /**
     * @dev Get the contract owner
     * @return The owner address
     */
    function owner() external view returns (address);

    // Inherited from FunctionAssetConsumer - price oracle functions
    /**
     * @dev Get asset price from oracle
     * @param asset The asset symbol
     * @param subscriptionId Chainlink Functions subscription ID
     * @return requestId The request ID for tracking
     */
    function getAssetPrice(
        string memory asset,
        uint64 subscriptionId
    ) external returns (bytes32 requestId);

    /**
     * @dev Get latest price for an asset
     * @param asset The asset symbol
     * @return price The latest price
     */
    function getLatestPrice(
        string memory asset
    ) external view returns (uint256 price);

    /**
     * @dev Get response for a request ID
     * @param requestId The request ID
     * @return response The response bytes
     */
    function requestIdToResponse(
        bytes32 requestId
    ) external view returns (bytes memory response);

    /**
     * @dev Get error for a request ID
     * @param requestId The request ID
     * @return error The error bytes
     */
    function requestIdToError(
        bytes32 requestId
    ) external view returns (bytes memory error);

    /**
     * @dev Get asset for a request ID
     * @param requestId The request ID
     * @return asset The asset symbol
     */
    function requestIdToAsset(
        bytes32 requestId
    ) external view returns (string memory asset);

    /**
     * @dev Get stored price for an asset
     * @param asset The asset symbol
     * @return price The stored price
     */
    function assetToPrice(
        string memory asset
    ) external view returns (uint256 price);
}
