pragma solidity ^0.8.0;
import "../ERC20/ERC20.sol";

contract SophisticatedInvestorCertificateAuthorityRegistry {
    constructor() {
    }

    mapping(address => bool) sophisticatedInvestors;

    function addSophisticatedInvestor(address newSophisticatedInvestor) public {
        sophisticatedInvestors[newSophisticatedInvestor] = true;
    }

    function removeSophisticatedInvestor(address sophisticatedInvestor) public {
        sophisticatedInvestors[sophisticatedInvestor] = false;
    }

}