// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface ISpout {
    // Events
    event InterestReleased(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    event MaturityDateSet(uint256 maturityDate);
    event CouponRateSet(uint256 couponRate);
    event MarketDataConsumerSet(address indexed consumer);

    // Core RWA functions
    function initializeRWA(
        uint256 _maturityDate,
        uint256 _couponRate,
        address _marketDataConsumer
    ) external;

    function interestRelease(address owner) external;

    function calculateInterest(address owner) external view returns (uint256);

    // Bond information functions
    function maturityDate() external view returns (uint256);

    function couponRate() external view returns (uint256);

    function lastInterestPayment() external view returns (uint256);

    function totalInterestPaid() external view returns (uint256);

    function marketDataConsumer() external view returns (address);

    // Bond status functions
    function isMatured() external view returns (bool);

    function timeUntilMaturity() external view returns (uint256);

    function getYieldToMaturity() external view returns (uint256);

    // Configuration functions
    function setMarketDataConsumer(address _newConsumer) external;

    // RWA-specific validation
    function validateRWATransfer(
        address from,
        address to,
        uint256 amount
    ) external view returns (bool);

    // Batch operations
    function batchInterestRelease(address[] calldata owners) external;

    // Bond information
    function getBondInfo()
        external
        view
        returns (
            uint256 _maturityDate,
            uint256 _couponRate,
            bool _isMatured,
            uint256 _timeUntilMaturity
        );
}
