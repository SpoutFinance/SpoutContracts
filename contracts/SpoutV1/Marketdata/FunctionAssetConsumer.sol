// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract FunctionAssetConsumer is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    string public s_lastAsset; // The price of the last quoted asset
    string public s_requestedAsset;
    uint256 public s_lastAssetPrice;
    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Supported networks https://docs.chain.link/chainlink-functions/supported-networks
    address constant ROUTER = 0xf9B8fc078197181C841c296C876945aaa425B278; // The router address for Base Sepolia
    bytes32 constant DON_ID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

    //Callback gas limit
    uint32 constant GAS_LIMIT = 300000;

    string public constant SOURCE =
        "const asset = args[0];"
        "const url = `https://data.alpaca.markets/v2/stocks/quotes/latest?symbols=${asset}`;"
        "const options = {"
        "  method: 'GET',"
        "  headers: {"
        "    accept: 'application/json',"
        "    'APCA-API-KEY-ID': 'PK4GP2JHLHR1W846ENF9',"
        "    'APCA-API-SECRET-KEY': '4pO04ynDBGWThgERuE0SYApMclOYxumv8ha6gdZq'"
        "  }"
        "};"
        "const response = await Functions.makeHttpRequest({ url, ...options });"
        "if (response.error) {"
        "  throw Error('Request failed');"
        "}"
        "const json = response.data;"
        "const askPrice = json?.quotes?.LQD?.ap;"
        "if (typeof askPrice !== 'number') {"
        "  throw Error('askPrice is not a valid number');"
        "}"
        "const scaledPrice = Math.round(askPrice * 100);"
        "return Functions.encodeUint256(scaledPrice);";

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        string asset,
        bytes response,
        bytes err
    );

    error UnexpectedRequestID(bytes32 requestId);

    constructor() FunctionsClient(ROUTER) {}

    function getAssetPrice(
        string memory asset,
        uint64 subscriptionId
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE); // Initialize the request with JS code

        string[] memory args = new string[](1);
        args[0] = asset;
        req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            GAS_LIMIT,
            DON_ID
        );
        s_requestedAsset = asset;
        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }

        s_lastError = err;
        s_lastResponse = response;

        s_lastAssetPrice = abi.decode(response, (uint256));
        s_lastAsset = s_requestedAsset;
    }
}
