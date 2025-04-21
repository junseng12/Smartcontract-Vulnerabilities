// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Implementation {
    address public owner;
    uint256 public value;

    function initialize(address _owner, uint256 _value) external {
        require(owner == address(0), "Already initialized");
        owner = _owner;
        value = _value;
    }

    function setValue(uint256 _newValue) external {
        require(msg.sender == owner, "Not owner");
        value = _newValue;
    }

    function getValue() external view returns (uint256) {
        return value;
    }

    fallback() external payable {
    // do nothing or log something
    }
}
