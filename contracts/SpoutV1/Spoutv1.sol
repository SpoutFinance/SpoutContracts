// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IToken} from "@tokenysolutions/t-rex/contracts/token/IToken.sol";
import {Token} from "@tokenysolutions/t-rex/contracts/token/Token.sol";
import {IdentityRegistry} from "@tokenysolutions/t-rex/contracts/registry/implementation/IdentityRegistry.sol";

contract Spoutv1 is Token {
    constructor() {}

    event InterestReleased(address indexed owner, uint256 amount);

    function interestRelease(address owner) external onlyOwner {}
}
