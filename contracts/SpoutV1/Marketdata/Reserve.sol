// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Reserve is FunctionsClient, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    // Mappings to track requests and responses
    mapping(bytes32 => address) public requestIdToUser;
    mapping(bytes32 => bytes) public requestIdToResponse;
    mapping(bytes32 => bytes) public requestIdToError;
    uint256 public totalReserves;

    // Chainlink Functions configuration - Base Sepolia
    address constant ROUTER = 0xf9B8fc078197181C841c296C876945aaa425B278;
    bytes32 constant DON_ID =
        0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000;
    uint32 constant GAS_LIMIT = 300000;

    // JavaScript source code for Chainlink Functions
    string public constant SOURCE =
        "const url = 'https://rwa-deploy-backend.onrender.com/api/reserves/asset-reserve';"
        "const options = {"
        "  method: 'GET',"
        "  headers: {"
        "    'Content-Type': 'application/json',"
        "    'X-API-Key': 'gra8B9ghR5cIsIn16'"
        "  }"
        "};"
        "const response = await Functions.makeHttpRequest({ url, ...options });"
        "if (response.error) {"
        "  throw Error('API request failed');"
        "}"
        "const reserves = response.data.reserves || 0;"
        "return Functions.encodeUint256(Math.floor(reserves * 1e6));"; // Scale to 6 decimals

    event ReservesRequested(bytes32 indexed requestId, address indexed user);
    event ReservesUpdated(
        bytes32 indexed requestId,
        address indexed user,
        uint256 reserves
    );

    error UnexpectedRequestID(bytes32 requestId);

    constructor(address _owner) FunctionsClient(ROUTER) {
        _transferOwnership(_owner);
    }

    // User function to request reserves from backend
    function requestReserves(
        uint64 subscriptionId
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE);

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            GAS_LIMIT,
            DON_ID
        );
        requestIdToUser[requestId] = msg.sender;

        emit ReservesRequested(requestId, msg.sender);
        return requestId;
    }

    // Chainlink Functions callback
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        address user = requestIdToUser[requestId];
        if (user == address(0)) {
            revert UnexpectedRequestID(requestId);
        }

        requestIdToResponse[requestId] = response;
        requestIdToError[requestId] = err;

        if (err.length == 0) {
            uint256 reserves = abi.decode(response, (uint256));
            totalReserves = reserves;
            emit ReservesUpdated(requestId, user, reserves);
        }
    }

    // Get latest total reserves
    function getReserves() external view returns (uint256) {
        return totalReserves;
    }
}
