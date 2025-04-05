// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Implementation {
    address public owner;
    uint256 public value;
    // 클론된 컨트랙트는 생성자가 없으므로 초기화 필요
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
}