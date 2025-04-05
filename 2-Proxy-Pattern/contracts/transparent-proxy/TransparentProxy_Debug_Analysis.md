# 🛠️ Transparent Proxy 실습 디버그 분석

---

## 📌 디버깅 목표

- delegatecall 실행 중 발생하는 msg.sender, storage layout 확인
- Proxy의 fallback 함수 내부 흐름 분석
- LogicV1 → LogicV2 업그레이드 후 데이터 연속성 확인

---

## 🔍 함수 호출 흐름

1. `proxyAsLogicV1.setVars(42)` 호출
2. fallback() 진입
3. delegatecall → LogicV1.setVars 실행
4. LogicV1 내부에서 `num`, `sender` 저장
   → 실제 저장 위치는 Proxy 컨트랙트의 slot 0, 1

---

## 🧪 상태 변화 로그

```text
Deployer: 0xf39F...
LogicV1 deployed at: 0x5FbD...
Proxy deployed at: 0xe7f1...
✅ Proxy through LogicV1.setVars(42) called
Proxy state - num: 42 sender: 0xf39F...

LogicV2 deployed at: 0xCf7E...
🔁 Proxy upgraded to LogicV2
✅ Proxy through LogicV2.setVars(99) called
Proxy state - num: 99 sender: 0xf39F... version: v2
```

---

## ⚠️ 디버깅 포인트

- Proxy 컨트랙트의 `slot 0`, `1`, `2`에 LogicV2의 값이 정상 저장됨
- LogicV2에 string version 추가해도, Proxy가 해당 slot을 사용하지 않았다면 충돌 없음
- LogicV1 → V2 확장이 안전하게 이루어졌음을 확인

---

## 🧩 배운 점

| 항목           | 요점                                             |
| -------------- | ------------------------------------------------ |
| Storage layout | slot 순서와 타입이 가장 중요 (이름은 무의미)     |
| delegatecall   | 코드만 실행하고 저장소는 Proxy 사용              |
| msg.sender     | delegatecall에서도 EOA 유지됨                    |
| version 추가   | 기존 slot 안 쓰면 충돌 없음 (단, 중간 삽입 금지) |

---

## 🧠 실전 감각 정리

- **Logic 컨트랙트는 stateless, Proxy만이 state를 가진다**고 간주
- storage layout mismatch는 디버깅 로그 없이도 작동은 되지만, 예측 불가 버그 초래
- 실전에서는 layout 안전성 검사 도구(solc --storage-layout, OZ upgrades plugin 등) 필수
