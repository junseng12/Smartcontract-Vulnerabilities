# 🧪 Minimal Proxy (EIP-1167) 실습 정리

## ✅ 실습 목적

- EIP-1167 Minimal Proxy 구조 이해
- delegatecall을 활용한 가스 최적화 방식 파악
- 기존 Proxy와의 차이점 비교 분석
- bytecode 수준의 구조 분석 및 안전한 메모리 사용 방식 학습
- 클론 패턴을 통한 컨트랙트 대량 배포 전략 이해

---

## 🔍 핵심 개념 요약

### 📦 EIP-1167 Minimal Proxy란?

- 로직을 직접 포함하지 않고, **기존 로직 컨트랙트 주소에 delegatecall**만 수행하는 최소 바이트코드 컨트랙트
- 가스 최적화, 대량 배포 등에 매우 유리
- 클론 컨트랙트는 bytecode만 존재하며, ABI 없음 → 수동 제공 필요

### ⚙️ Minimal Proxy Bytecode 구조

| 구성요소  | 바이트 수       | 설명                                            |
| --------- | --------------- | ----------------------------------------------- |
| Prefix    | 10 bytes        | delegatecall 수행을 위한 고정 오퍼코드          |
| Impl 주소 | 20 bytes        | 참조할 로직 컨트랙트 주소 (delegatecall target) |
| Suffix    | 15 bytes        | 반환 및 종료 처리                               |
| **총합**  | 55 bytes (0x37) | 전체 최소 Proxy 바이트코드 길이                 |

```
┌────────────┬────────────────────┬──────────────┐
│   Prefix   │  Logic 주소 (impl) │    Suffix    │
│  10 bytes  │     20 bytes       │   15 bytes   │
└────────────┴────────────────────┴──────────────┘
```

### 🔍 prefix / impl / suffix 저장 위치

- `mstore(ptr, ...)` → 32바이트 정렬 저장이 기본
- **prefix는 10바이트지만 0x00~0x20 전체 공간 차지**
- impl은 `mstore(ptr + 0x14, shl(96, impl))`로 **앞쪽 0-padding**, 뒤에 20바이트 저장
- suffix는 그 뒤 `ptr + 0x28`부터 저장
- 즉, 총 저장 위치:
  - prefix: 0x00~0x20
  - impl padded: 0x14~0x34
  - suffix: 0x28~0x37

### 🔐 Proxy와 Minimal Proxy의 차이

| 구분         | 일반 Proxy                    | Minimal Proxy (EIP-1167)              |
| ------------ | ----------------------------- | ------------------------------------- |
| 구조         | 구현, 상태 저장               | delegatecall만 수행하는 최소 구조     |
| 바이트코드   | fallback + routing logic 존재 | 고정된 바이트코드 구조 (55 bytes)     |
| ABI          | Proxy에 ABI 있음              | Minimal Proxy는 없음 (직접 지정 필요) |
| upgrade 방식 | upgrade 함수 내장 가능        | upgrade 자체는 외부 factory가 제어    |

---

## 🧪 실습 핵심 흐름

1. `Implementation.sol`: initialize, getValue 함수 포함
2. `MinimalProxyFactory`: EIP-1167 방식으로 클론 생성
3. `createClone()` 함수:
   - `mload(0x40)` 위치부터 바이트코드 직접 저장
   - `create(0, ptr, 0x37)` 호출로 clone 배포
4. JS Script (`minimalTest.js`):
   - logic → factory 배포
   - `createClone()`으로 clone 생성
   - `ethers.getContractAt()` 또는 `ethers.Contract()`로 ABI 수동 주입
   - getValue 실행 오류 시: ABI 누락 or callStatic 미사용 문제 확인 필요

---

## 🧭 다음 실습을 위한 개념 기반

- **Minimal Proxy는 ABI 없이 clone만 존재** → `new ethers.Contract(address, abi)` 활용
- clone은 로직 주소를 참조하지만 storage는 독립
- 일반 Proxy와 달리, **Proxy 코드 자체가 55바이트 minimal 코드**

---

## 🧩 디버깅 시 주의점

- cloneAddress 추출 방식: `tx.wait().logs[0].args.proxy` 또는 `return clone;`
- getContractAt() 사용 시 오류 발생 가능 → ABI 직접 정의 필요
- getValue는 view 함수로, `callStatic` 사용이 더 안전

---

## 📁 디렉토리 구조 예시

```
2-Proxy-Pattern/
├── contracts/
│   ├── Implementation.sol
│   └── MinimalProxyFactory.sol
├── scripts/
│   └── minimalTest.js
├── artifacts/
├── cache/
└── README.md (이 파일)
```

---

## ✅ 실습 완료 시 상태

- clone 컨트랙트 정상 배포
- `initialize()`로 상태 세팅
- `getValue()`를 통해 clone의 상태 확인 완료
- bytecode 구조, delegatecall 동작 완전 이해

✅ **진짜 clone의 상태 확인에 성공한 방식**:

```js
const abi = ["function getValue() view returns (uint256)"];
const cloneInstance = new ethers.Contract(cloneAddress, abi, deployer);
const value = await cloneInstance.getValue();
```

---

## 🎓 학습 메모 요약

- `mstore()`는 항상 32바이트 단위
- 0x14 offset 이유: prefix 10B를 저장해도 32B 공간 차지 → 충돌 피하기 위함
- suffix 위치도 0x28부터 32B 덩어리로 안전하게 배치
- Proxy와 Minimal Proxy는 **용도, 가스, 추상화 수준**이 다름
