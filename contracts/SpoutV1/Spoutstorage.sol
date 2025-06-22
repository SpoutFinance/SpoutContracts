// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract SpoutTokenStorage {
    // RWA-specific storage variables
    struct BondInfo {
        uint256 maturityDate;
        uint256 couponRate;
        uint256 lastInterestPayment;
        uint256 totalInterestPaid;
        address marketDataConsumer;
        bool isInitialized;
    }
    
    struct HolderInfo {
        uint256 lastInterestCalculation;
        uint256 accumulatedInterest;
        uint256 lastBalance;
    }
    
    // Bond information
    BondInfo public bondInfo;
    
    // Mapping from holder address to their specific information
    mapping(address => HolderInfo) public holderInfo;
    
    // Interest calculation parameters
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Events for storage updates
    event BondInfoUpdated(uint256 maturityDate, uint256 couponRate);
    event HolderInfoUpdated(address indexed holder, uint256 lastCalculation);
}
