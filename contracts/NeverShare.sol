//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;
import "../ERC20/ERC20.sol";

contract NeverShare is ERC20 {
    constructor() ERC20("NeverShare", "NST") {
        _mint(msg.sender, 10000000000000000000000);
    }
}