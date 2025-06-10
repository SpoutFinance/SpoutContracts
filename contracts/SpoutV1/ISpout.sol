// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface ISpout {
    event InterestReleased(address indexed owner, uint256 amount);

    function interestRelease(address owner) external;
}
