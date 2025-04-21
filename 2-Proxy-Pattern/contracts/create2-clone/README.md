# 🧠 Create2 기반 Deterministic Clone 실습 요약

## 🎯 실습 목표

- CREATE2를 이용한 **예측 가능한 주소에 클론(Proxy) 배포** 학습
- 로직 컨트랙트는 단 하나, 사용자별 **독립된 상태**를 가지는 클론 생성
- Proxy 개념, delegatecall, 메모리 구성, 바이트코드 구성, ABI 연결까지 포함한 **스마트 컨트랙트 배포 및 구조 설계 흐름** 학습

---

## 1️⃣ Core Concept

### ✅ Minimal Proxy란?

- EIP-1167에 따라 설계된 **초경량 Proxy 컨트랙트**
- 로직(Implementation) 컨트랙트의 기능을 **delegatecall**로 위임
- Proxy는 자신의 storage를 사용, Logic의 코드를 실행

### ✅ CREATE2란?

- 스마트 컨트랙트를 배포할 때, `salt`, `bytecode`, `배포자 주소`를 기반으로 **컨트랙트 주소를 사전 계산**할 수 있는 방식
- 공식:

```
address = keccak256( 0xff ++ deployer_address ++ salt ++ keccak256(bytecode) )
```

- 이를 통해 **재현 가능한 주소 생성** 가능 → 재배포나 주소 고정에 유리함

### ✅ 왜 사용자별 클론을 만들까?

- `mapping(address => ...)` 방식은 중앙 집중적이며 확장성/보안에 취약
- 사용자마다 컨트랙트를 **개별 배포**하면:
  - 상태 격리
  - 지갑/거래소/DAO에서 유연하게 활용 가능
  - 컨트랙트 삭제 및 재배포 용이

---

## 2️⃣ 바이트코드 구성 (EIP-1167 Minimal Proxy)

| 구성요소  | 크기 (바이트) | 설명                                                          |
| --------- | ------------- | ------------------------------------------------------------- |
| Prefix    | 10 bytes      | delegatecall을 위한 고정 바이트코드 (0x3d602d80600a3d3981f3)  |
| Impl 주소 | 20 bytes      | 로직 컨트랙트 주소 (shl로 패딩 처리 포함)                     |
| Suffix    | 15 bytes      | 반환 및 종료 처리 오퍼코드 (0x5af43d82803e903d91602b57fd5bf3) |

총합: 10 + 20 + 15 = 45 bytes → mstore 시 32바이트 정렬 등으로 실제 메모리에서는 55 bytes (0x37) 사용

### 🔍 Impl 주소 저장 구조

- `shl(0x60, impl)` → 20바이트 주소를 왼쪽으로 96비트 시프트하여 앞쪽 0-padding 생성
- `mstore(add(ptr, 0x14), ...)` 위치에 저장 → prefix 이후 안전한 위치

## 3️⃣ Solidity 코드 분석: DeterministicFactory.sol

### 🛠 createClone

- `create2()` 사용해 미리 계산된 주소에 클론을 배포
- 메모리 구성:
  - `ptr`에서 시작하여 prefix, impl, suffix를 각각 `0x0`, `0x14`, `0x28`에 저장
  - 총 0x37(55) bytes 사용하여 create2 실행

### 🔮 computeCloneAddress

- 내부적으로 동일한 방식으로 bytecode 생성 후 keccak256 해시값 산출
- 이를 바탕으로 predictable address를 계산
- 핵심은 `0xff` + 배포자 주소 + salt + bytecode keccak256 결과를 다시 해시화

---

## 🧩 ABI 연결 개념 정리

### 🔧 getContractAt vs ethers.Contract

- `getContractAt(name, address)` → Hardhat에서 artifacts로 ABI 불러와서 address에 붙임
- `new ethers.Contract(address, abi, signer)` → 직접 ABI 수동 지정해서 붙임

---

## 🧬 실습 흐름 그래프

```
[1. Implementation 배포]
        │
        ▼
[2. CloneFactory 배포 (CREATE2 사용)]
        │
        ▼
[3. deterministicClone() 호출 → CREATE2로 클론 생성]
        │
        ├──> 예상주소 계산 (address = hash(salt, bytecode))
        │
        ▼
[4. 생성된 클론 인터페이스로 접근]
        │
        ▼
[5. initialize() 호출 → 상태값 설정]
        │
        ▼
[6. getValue() 또는 getOwner() 등으로 결과 확인]
```

---

## 💡 자주 헷갈리는 개념 정리

| 구분                        | 개념                  | 설명                                          |
| --------------------------- | --------------------- | --------------------------------------------- |
| `Implementation`            | 로직 컨트랙트         | Transparent Proxy의 LogicV1과 같은 역할       |
| `Minimal Proxy`             | delegatecall만 수행   | storage는 자신이 갖고, 로직만 위임            |
| `CREATE2`                   | 예측 주소 배포        | 실패 시 selfdestruct → 동일 주소 재사용 가능  |
| `Clone`                     | 독립 인스턴스         | 상태 분리, 로직 공유                          |
| `Factory`                   | 배포 관리자           | 클론을 CREATE2로 관리/생성                    |
| `ethers.getContractAt(...)` | ABI로 인터페이스 생성 | Minimal Proxy는 ABI가 없으므로 수동 지정 필요 |

---

## 🧪 주요 파일

- `Implementation.sol`: 로직 컨트랙트
- `CloneFactory.sol`: CREATE2 + Minimal Proxy 배포자
- `deterministicClone.js`: 실습 스크립트

---

## 📂 실습 디렉토리 구조

```
2-Proxy-Pattern/
├── contracts/
│   └── create2-clone/
│       ├── Implementation.sol
│       └── CloneFactory.sol
├── scripts/
│   └── deterministicClone.js
```

---

📊 시각화 요약: CREATE2 주소 예측

```lua
                   +------------------------------+
                   |           Factory            |
                   +------------------------------+
                              |
                              v
           ┌──────────────────────────────────────────────┐
           │ address = keccak256(                          │
           │   0xff ++ factory ++ salt ++ keccak256(init)  │
           │ )[12:]                                        │
           └──────────────────────────────────────────────┘
                              |
                              v
                   +------------------------------+
                   |      Predicted Clone         |
                   +------------------------------+
```

## ✅ 실습 팁

- `ethers.Contract(cloneAddress, abi, signer)`로 직접 인터페이스 연결 가능
- 주소 예측은 `getCreate2Address()` 유틸 사용
- 클론의 상태 확인 시 `Implementation` ABI 사용 필요

---

## 💡 주요 질문 정리 및 해답

| 질문                                 | 핵심 개념 해설                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| CREATE2는 왜 사용하는가?             | 예측 가능한 주소에 배포 가능 → upgrade, 미리 참조, 컨트랙트 소각 후 재배포 등 활용 |
| Impl 주소는 어떻게 패딩되는가?       | shl(0x60, address) → 20바이트 주소를 32바이트 정렬 위해 앞에 12바이트 0-padding    |
| computeCloneAddress()는 왜 필요한가? | 실제 배포 없이도 주소를 미리 계산 가능 (View 함수)                                 |
| 클론 상태 확인은 어떻게?             | clone에 ABI를 붙이거나 직접 Contract 객체 생성해서 getValue() 등 호출              |
| Minimal Proxy에서 ABI 없는 이유는?   | 자체 로직 없고, 전부 delegatecall만 하기 때문 → 실제 ABI는 로직 컨트랙트가 가짐    |

---

## ✅ 실습 완료 체크리스트

- [x] CREATE2 기반 Minimal Proxy 배포 구조 학습
- [x] 예측 주소 생성 및 비교 확인
- [x] clone에 ABI 바인딩하여 호출 성공 확인
- [x] Solidity + JS 상호작용 흐름 완전 이해
