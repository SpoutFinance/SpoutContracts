// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IToken} from "@tokenysolutions/t-rex/contracts/token/IToken.sol";
import {Token} from "@tokenysolutions/t-rex/contracts/token/Token.sol";
import {IdentityRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistry.sol";

contract Spoutv1 is Token {
    // RWA-specific state variables
    uint256 public maturityDate;
    uint256 public couponRate; // in basis points (1% = 100)
    uint256 public lastInterestPayment;
    uint256 public totalInterestPaid;
    address public marketDataConsumer;
    
    // Bond-specific events
    event InterestReleased(address indexed owner, uint256 amount, uint256 timestamp);
    event MaturityDateSet(uint256 maturityDate);
    event CouponRateSet(uint256 couponRate);
    event MarketDataConsumerSet(address indexed consumer);

    constructor() {}

    /**
     * @dev Initialize RWA-specific parameters
     * @param _maturityDate Unix timestamp when the bond matures
     * @param _couponRate Annual coupon rate in basis points
     * @param _marketDataConsumer Address of the market data consumer contract
     */
    function initializeRWA(
        uint256 _maturityDate,
        uint256 _couponRate,
        address _marketDataConsumer
    ) external onlyOwner {
        require(_maturityDate > block.timestamp, "Maturity date must be in the future");
        require(_couponRate <= 10000, "Coupon rate cannot exceed 100%");
        require(_marketDataConsumer != address(0), "Invalid market data consumer");
        
        maturityDate = _maturityDate;
        couponRate = _couponRate;
        marketDataConsumer = _marketDataConsumer;
        lastInterestPayment = block.timestamp;
        
        emit MaturityDateSet(_maturityDate);
        emit CouponRateSet(_couponRate);
        emit MarketDataConsumerSet(_marketDataConsumer);
    }

    /**
     * @dev Calculate and release interest for a specific owner
     * @param owner Address of the token holder
     */
    function interestRelease(address owner) external onlyOwner {
        _interestRelease(owner);
    }

    /**
     * @dev Internal function to calculate and release interest
     * @param owner Address of the token holder
     */
    function _interestRelease(address owner) internal {
        require(owner != address(0), "Invalid owner address");
        require(balanceOf(owner) > 0, "No tokens to calculate interest for");
        
        uint256 interestAmount = calculateInterest(owner);
        require(interestAmount > 0, "No interest to release");
        
        // Mint interest tokens to the owner
        mint(owner, interestAmount);
        
        totalInterestPaid += interestAmount;
        lastInterestPayment = block.timestamp;
        
        emit InterestReleased(owner, interestAmount, block.timestamp);
    }

    /**
     * @dev Calculate interest for a specific owner based on their balance and time held
     * @param owner Address of the token holder
     * @return Interest amount in token units
     */
    function calculateInterest(address owner) public view returns (uint256) {
        uint256 balance = balanceOf(owner);
        if (balance == 0) return 0;
        
        uint256 timeSinceLastPayment = block.timestamp - lastInterestPayment;
        uint256 annualInterest = (balance * couponRate) / 10000; // Convert basis points to percentage
        uint256 interest = (annualInterest * timeSinceLastPayment) / 365 days;
        
        return interest;
    }

    /**
     * @dev Check if the bond has matured
     * @return True if the bond has matured
     */
    function isMatured() public view returns (bool) {
        return block.timestamp >= maturityDate;
    }

    /**
     * @dev Get time until maturity in seconds
     * @return Time until maturity, 0 if already matured
     */
    function timeUntilMaturity() public view returns (uint256) {
        if (isMatured()) return 0;
        return maturityDate - block.timestamp;
    }

    /**
     * @dev Get current yield to maturity (simplified calculation)
     * @return Yield as a percentage in basis points
     */
    function getYieldToMaturity() public view returns (uint256) {
        if (isMatured()) return 0;
        
        uint256 timeToMaturity = timeUntilMaturity();
        uint256 annualizedTime = (timeToMaturity * 365 days) / (365 days);
        
        // Simplified YTM calculation
        return (couponRate * annualizedTime) / (365 days);
    }

    /**
     * @dev Update market data consumer address
     * @param _newConsumer New market data consumer address
     */
    function setMarketDataConsumer(address _newConsumer) external onlyOwner {
        require(_newConsumer != address(0), "Invalid address");
        marketDataConsumer = _newConsumer;
        emit MarketDataConsumerSet(_newConsumer);
    }

    /**
     * @dev RWA-specific transfer validation
     * This function can be called before transfer to add RWA-specific checks
     * @param from The address of the sender
     * @param to The address of the receiver
     * @param amount The number of tokens to transfer
     * @return True if transfer is allowed
     */
    function validateRWATransfer(
        address from,
        address to,
        uint256 amount
    ) public view returns (bool) {
        // Add any RWA-specific transfer restrictions here
        // For example, prevent transfers after maturity, etc.
        
        // Example: Prevent transfers after maturity
        if (isMatured()) {
            return false;
        }
        
        // Example: Add minimum transfer amount
        if (amount < 1000) { // Minimum 1000 tokens (with 6 decimals)
            return false;
        }
        
        return true;
    }

    /**
     * @dev Batch interest release for multiple holders
     * @param owners Array of token holder addresses
     */
    function batchInterestRelease(address[] calldata owners) external onlyOwner {
        for (uint256 i = 0; i < owners.length; i++) {
            if (balanceOf(owners[i]) > 0) {
                _interestRelease(owners[i]);
            }
        }
    }

    /**
     * @dev Get bond information
     * @return _maturityDate Maturity date
     * @return _couponRate Coupon rate in basis points
     * @return _isMatured Whether bond is matured
     * @return _timeUntilMaturity Time until maturity
     */
    function getBondInfo() external view returns (
        uint256 _maturityDate,
        uint256 _couponRate,
        bool _isMatured,
        uint256 _timeUntilMaturity
    ) {
        return (
            maturityDate,
            couponRate,
            isMatured(),
            timeUntilMaturity()
        );
    }
}
