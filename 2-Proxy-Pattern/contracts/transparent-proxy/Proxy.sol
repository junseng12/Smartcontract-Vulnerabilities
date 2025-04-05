// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Proxy {
    uint256 public num;
    address public sender;
    string public version;
    address public implementation;
    address public owner;

    constructor(address _implementation) {
        implementation = _implementation;
        owner = msg.sender;
    }

    function upgrade(address _newImplementation) public {
        require(msg.sender == owner, "Not owner");
        implementation = _newImplementation;
    }
    //정의되지 않은 모든 함수 호출을 가로채서 처리하는 함수
    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), "No implementation set");

        assembly {
            //사용자의 호출 데이터(callData)를 복사
            // calldatasize() : 현재 호출된 함수의 데이터 길이 반환(호출 데이터는 함수 호출에 포함된 인자들을 포함하며, 이 함수는 이 데이터의 바이트 수 반환)
            // calldatacopy() : 호출된 데이터의 일부를 메모리로 복사하는 함수, 3개의 인자 존재 1. 복사할 메모리 위치 2. 복사할 호출 데이터의 시작 인덱스 3. 복사할 바이트 수
            calldatacopy(0, 0, calldatasize())

            //Logic 컨트랙트의 함수 실행 (Proxy의 storage를 사용)
            // delegatecall(gas, target, inOffset, inSize, outOffset, outSize)
            // gas() : 현재 사용할 수 있는 가스의 양을 반환하는 내장 함수입니다. 이 값은 호출이 실행되는 동안 사용할 수 있는 최대 가스 지정
            // target : delegatecall로 실행할 스마트 컨트랙트의 주소
            // inOffset : 호출되는 함수에 전달될 데이터의 시작 위치, 0은 호출 데이터의 처음부터 시작하겠다는 뜻
            // inSize : 호출할 데이터의 크기, 현재 호출의 데이터 크기만큼을 impl 컨트랙트로 전달
            // outOffset : 호출 후 반환된 데이터를 복사할 메모리 위치
            // outSize : 호출 후 반환되는 데이터의 크기
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            
            //반환값을 복사
            returndatacopy(0, 0, returndatasize())
            
            //성공이면 return, 실패면 revert
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
