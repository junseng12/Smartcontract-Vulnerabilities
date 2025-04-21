// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeterministicFactory {
    event CloneCreated(address cloneAddress);

    function createClone(address implementation, bytes32 salt) external returns (address clone) {
        // 1. EIP-1167 Minimal Proxy Bytecode 조합
        bytes memory bytecode = abi.encodePacked(
        //개념상 prefix는 10바이트지만,💡 EVM의 delegatecall 처리 안정성과 표준 호환을 위해 📦 실제 구현에서는 26바이트짜리 prefix (EIP-1167 full form) 를 써줌
        hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
        bytes20(implementation),
        hex"5af43d82803e903d91602b57fd5bf3"
        );


        // 2. create2로 배포
        assembly {
            let encoded_data := add(bytecode, 0x20) // bytecode 첫 주소 (skip length header)
            let encoded_size := mload(bytecode)     // 실제 바이트코드 길이
            clone := create2(0, encoded_data, encoded_size, salt)
        }

        // 3. 실패 시 revert
        require(clone != address(0), "Clone deployment failed!");
        emit CloneCreated(clone);
    }

    function computeCloneAddress(address implementation, bytes32 salt) external view returns (address predicted) {
        bytes memory bytecode = abi.encodePacked(
        hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
        bytes20(implementation),
        hex"5af43d82803e903d91602b57fd5bf3"
        );

        bytes32 hash = keccak256(bytecode);

        predicted = address(
            uint160(uint(keccak256(abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                hash
            ))))
        );
    }
}


