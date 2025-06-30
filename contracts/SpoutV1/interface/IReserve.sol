// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IReserve
 * @dev Interface for the Reserve contract to be used by automation and other contracts
 */
interface IReserve {
    // Events
    event ReservesRequested(bytes32 indexed requestId, address indexed user);
    event ReservesUpdated(
        bytes32 indexed requestId,
        address indexed user,
        uint256 reserves
    );

    // Errors
    error UnexpectedRequestID(bytes32 requestId);

    /**
     * @dev Request reserves data from backend API via Chainlink Functions
     * @param subscriptionId The Chainlink Functions subscription ID
     * @return requestId The request ID for tracking the request
     */
    function requestReserves(
        uint64 subscriptionId
    ) external returns (bytes32 requestId);

    /**
     * @dev Get the latest total reserves amount
     * @return The total  reserves amount (scaled to 6 decimals)
     */
    function getReserves() external view returns (uint256);

    /**
     * @dev Get the total reserves amount (view function)
     * @return The total reserves amount
     */
    function totalReserves() external view returns (uint256);

    /**
     * @dev Get the response for a specific request ID
     * @param requestId The request ID to check
     * @return The response bytes
     */
    function requestIdToResponse(
        bytes32 requestId
    ) external view returns (bytes memory);

    /**
     * @dev Get the error for a specific request ID
     * @param requestId The request ID to check
     * @return The error bytes
     */
    function requestIdToError(
        bytes32 requestId
    ) external view returns (bytes memory);

    /**
     * @dev Get the user who made a specific request
     * @param requestId The request ID to check
     * @return The user address
     */
    function requestIdToUser(bytes32 requestId) external view returns (address);
}
