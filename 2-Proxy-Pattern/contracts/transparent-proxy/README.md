# 🧠 Transparent Proxy 패턴 실습 리포트

이 실습은 `delegatecall` 기반의 스마트컨트랙트 업그레이드 메커니즘 중 가장 널리 사용되는 **Transparent Proxy 패턴**을 학습한 내용을 정리한 것입니다.

---

## 🎯 실습 목적

- Proxy 패턴의 동작 구조 학습
- delegatecall 사용 시 **storage layout의 중요성** 이해
- Proxy ↔ Logic 간의 호출 흐름 이해
- 실전 업그레이드 구조 (Transparent, UUPS, Beacon) 개념 습득

---

## 🧱 프로젝트 구조

```
/transparent-proxy/
├── Proxy.sol              # delegatecall을 수행하는 Proxy 컨트랙트
├── LogicV1.sol            # 첫 번째 로직 컨트랙트
├── LogicV2.sol            # 업그레이드된 로직 컨트랙트
├── proxyTest.js           # 테스트 스크립트
└── README.md
```

---

## 🔁 핵심 흐름 구조

```
EOA → Proxy.fallback()
     ↳ delegatecall → LogicV1.setVars()
                   ↳ LogicV1는 Proxy의 저장소에 값을 저장
```

- LogicV1/LogicV2는 코드를 "빌려주기만" 할 뿐
- 실제 데이터를 저장하는 것은 **항상 Proxy 컨트랙트**

---

## ⚙️ delegatecall의 핵심 이해

| 개념 | 설명 |
|------|------|
| 코드 제공 | LogicV1, LogicV2 |
| 저장소 | Proxy (항상 여기에 기록됨) |
| 실행 주체 | Proxy |
| msg.sender | EOA 유지 (delegatecall은 context를 유지함) |

```solidity
delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
```

---

## 🧠 Storage Layout 구조 정렬의 중요성

| Proxy 선언 | Logic 선언 | Slot |
|------------|-------------|------|
| uint256 num | uint256 num | 0 |
| address sender | address sender | 1 |
| string version | string version | 2+ (dynamic) |

> ❗ 변수명은 중요하지 않음  
> ✅ 변수 **타입과 선언 순서**가 정확히 일치해야 delegatecall 시 충돌 없음

---

## ✅ Proxy 구조 개선 전략

- Proxy가 직접 변수 선언 → 반드시 Logic 컨트랙트와 **순서, 타입 일치**
- 추가 변수 확장 대비: `uint256[50] private __gap;` 확보
- string, bytes 등 동적 변수 이후 확장에 주의

---

## 📌 Proxy vs UUPS vs Beacon 비교

| 패턴 | 설명 | 장점 | 단점 |
|------|------|------|------|
| Transparent Proxy | Proxy가 delegatecall 수행 | OpenZeppelin 표준, 직관적 | Proxy에 직접 변수 선언 필요 |
| UUPS (Universal Upgradeable Proxy Standard) | Logic에서 upgrade 함수 직접 구현 | Gas 효율적, 최신 트렌드 | Logic이 upgrade 권한도 가짐 |
| Beacon Proxy | Beacon 컨트랙트가 implementation 관리 | 여러 Proxy에 일괄 업그레이드 | 복잡도 증가 |

---

## 🧪 실습 결과

| 항목 | 결과 |
|------|------|
| LogicV1 실행 | Proxy에 값 저장: num = 42, sender = EOA |
| LogicV2 업그레이드 | Proxy 저장소 유지됨 |
| LogicV2 실행 | num = 99, sender = EOA, version = "v2" |
| delegatecall 흐름 | 정상 작동 |

---

## 💡 배운 점

- Proxy와 Logic 간의 역할을 **물리적으로 분리**하되, **storage는 공유**한다는 사실
- slot 충돌 방지, 버전 확장 가능성 대비를 위한 `storage layout` 설계가 매우 중요
- delegatecall은 코드만 빌리고, 저장소와 context(msg.sender 등)는 유지된다는 개념적 구조를 실제 코드로 체화

---

**실습자**: JUNSEUNG  
**실습 환경**: Hardhat, Ethers.js, Solidity 0.8.x  
