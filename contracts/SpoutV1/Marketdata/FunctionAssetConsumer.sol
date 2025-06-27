// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract FunctionAssetConsumer is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    // Mappings to support multiple assets
    mapping(bytes32 => string) public requestIdToAsset;
    mapping(string => uint256) public assetToPrice;
    mapping(bytes32 => bytes) public requestIdToResponse;
    mapping(bytes32 => bytes) public requestIdToError;

    // Supported networks https://docs.chain.link/chainlink-functions/supported-networks
    address constant ROUTER = 0xf9B8fc078197181C841c296C876945aaa425B278; // Base Sepolia
    bytes32 constant DON_ID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;

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
        "const askPrice = json?.quotes?.[asset]?.ap;"
        "if (typeof askPrice !== 'number') {"
        "  throw Error('askPrice is not a valid number');"
        "}"
        "const scaledPrice = Math.round(askPrice * 100);"
        "return Functions.encodeUint256(scaledPrice);";

    event Response(
        bytes32 indexed requestId,
        string asset,
        uint256 price,
        bytes response,
        bytes error
    );

    error UnexpectedRequestID(bytes32 requestId);

    constructor() FunctionsClient(ROUTER) {}

    function getAssetPrice(
        string memory asset,
        uint64 subscriptionId
    ) public returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(SOURCE);

        string[] memory args = new string[](1);
        args[0] = asset;
        req.setArgs(args);

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            GAS_LIMIT,
            DON_ID
        );

        requestIdToAsset[requestId] = asset;
        return requestId;
    }

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
    }

    function getPrice(string memory asset) external view returns (uint256) {
        return assetToPrice[asset];
    }
}
