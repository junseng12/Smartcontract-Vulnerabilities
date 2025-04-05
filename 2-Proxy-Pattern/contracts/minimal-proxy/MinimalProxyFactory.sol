// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/Clones.sol";

contract MinimalProxyFactory {
    using Clones for address;
    event ProxyDeployed(address proxy);

    // createClone 함수는 EIP-1167 방식으로 최소 Proxy를 생성
    function createClone(address implementation) external returns (address clone) {
        //로직 컨트랙트 주소를 20바이트로 슬라이스 (EVM 주소는 20바이트)
        clone = implementation.clone(); // EIP-1167 방식 안전하게 사용
        emit ProxyDeployed(clone);
    }
}