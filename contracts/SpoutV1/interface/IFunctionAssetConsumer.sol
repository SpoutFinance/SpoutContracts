// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFunctionAssetConsumer {
    function getAssetPrice(
        string memory asset,
        uint64 subscriptionId
    ) external returns (bytes32 requestId);

    function getPrice(string memory asset) external view returns (uint256);
}
