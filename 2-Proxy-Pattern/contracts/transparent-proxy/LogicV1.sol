// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogicV1 {
    uint256 public num;
    //디버깅/감사/추적용
    //"Proxy를 통해 이 함수가 호출되었는지" 또는 잘못된 caller가 호출했는지 추적 가능
    address public sender;
    // string public version;

    function setVars(uint256 _num) public {
        num = _num;
        sender = msg.sender;
    }

    function getVars() public view returns (uint256, address) {
        return (num, sender);
    }
}
