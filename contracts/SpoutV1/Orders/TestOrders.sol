// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Orders.sol";
import "../Marketdata/FunctionAssetConsumer.sol";

contract TestOrders is Orders, MockFunctionAssetConsumer {
    constructor() Orders() MockFunctionAssetConsumer() {}

    // Use the mock's getAssetPrice
    function getAssetPrice(
        string memory asset,
        uint64 subscriptionId
    )
        public
        override(FunctionAssetConsumer, MockFunctionAssetConsumer)
        returns (bytes32 requestId)
    {
        return MockFunctionAssetConsumer.getAssetPrice(asset, subscriptionId);
    }

    // Use the Orders' fulfillRequest
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override(FunctionAssetConsumer, Orders) {
        Orders.fulfillRequest(requestId, response, err);
    }
}
