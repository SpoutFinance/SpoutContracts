// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// Interface for callback receiver
interface IOrdersReceiver {
    function fulfillBuyOrder(bytes32 requestId, uint256 price) external;
}
