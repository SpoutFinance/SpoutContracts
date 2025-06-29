// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IReserve} from "../interface/IReserve.sol";

contract ReserveAutomation is AutomationCompatibleInterface, Ownable {
    IReserve public immutable reserveContract;
    uint64 public immutable subscriptionId;
    uint256 public immutable updateInterval;

    uint256 public lastUpdateTime;

    event AutomationTriggered(uint256 timestamp, bytes32 requestId);

    constructor(
        address _reserveContract,
        uint64 _subscriptionId,
        uint256 _updateInterval,
        address _owner
    ) {
        reserveContract = IReserve(_reserveContract);
        subscriptionId = _subscriptionId;
        updateInterval = _updateInterval;
        lastUpdateTime = block.timestamp;
        _transferOwnership(_owner);
    }

    /**
     * @dev Called by Chainlink Automation to check if upkeep is needed
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = (block.timestamp - lastUpdateTime) >= updateInterval;
        performData = "";
    }

    /**
     * @dev Called by Chainlink Automation when upkeep is needed
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        // Verify condition again (best practice)
        if ((block.timestamp - lastUpdateTime) < updateInterval) {
            return;
        }

        // Update timestamp before external call
        lastUpdateTime = block.timestamp;

        // Call Reserve contract to request updated reserves
        bytes32 requestId = reserveContract.requestReserves(subscriptionId);

        emit AutomationTriggered(block.timestamp, requestId);
    }

    // Emergency manual trigger (owner only, for testing)
    function triggerNow() external onlyOwner {
        lastUpdateTime = block.timestamp;
        bytes32 requestId = reserveContract.requestReserves(subscriptionId);
        emit AutomationTriggered(block.timestamp, requestId);
    }
}
