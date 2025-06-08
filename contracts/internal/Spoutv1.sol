pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IToken} from "@tokenysolutions/t-rex/contracts/token/IToken.sol";
import {Token} from "@tokenysolutions/t-rex/contracts/token/Token.sol";

contract Spoutv1 is Token {
    constructor() {}

    function isClaimValid(
        IIdentity _identity,
        uint256 claimTopic,
        bytes calldata sig,
        bytes calldata data
    ) external view returns (bool);
}
