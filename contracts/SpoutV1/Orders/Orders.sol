// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IFunctionAssetConsumer} from "../Marketdata/IFunctionAssetConsumer.sol";

contract Orders is Ownable {
    event BuyOrderCreated(address token, uint256 amount, uint256 price);
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
}
