// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IToken} from "@tokenysolutions/t-rex/contracts/token/IToken.sol";
import {Token} from "@tokenysolutions/t-rex/contracts/token/Token.sol";

contract Spoutv1 is Token {
    constructor() {}
}
