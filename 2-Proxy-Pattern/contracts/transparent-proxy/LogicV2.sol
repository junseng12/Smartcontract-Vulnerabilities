// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogicV2 {
    uint256 public num;
    address public sender;
    string public version;

    function setVars(uint256 _num) public {
        num = _num;
        sender = msg.sender;
        version = "v2";
    }

    function getVars() public view returns (uint256, address, string memory) {
        return (num, sender, version);
    }
}