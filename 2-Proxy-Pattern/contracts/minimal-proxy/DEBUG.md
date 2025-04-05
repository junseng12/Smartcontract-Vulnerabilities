# 🐞 Debug Log: Minimal Proxy 실습

## ❗ 발생한 주요 오류 & 해결 전략

---

### [1] `getValue()` 호출 시 `BAD_DATA` 오류

**원인:**

- Minimal Proxy는 바이트코드로 생성됨 → 자체 ABI 없음
- `ethers.getContractAt("Implementation", cloneAddress)`는 ABI 추론 실패

**해결:**

```js
const abi = ["function getValue() view returns (uint256)"];
const cloneInstance = new ethers.Contract(cloneAddress, abi, deployer);
await cloneInstance.getValue();
```

---

### [2] cloneAddress 잘못 추출

**원인:**

- `await factory.createClone()`은 트랜잭션 객체 반환
- 주소는 `receipt.logs[0].args.proxy`에서 추출해야 함

**해결:**

```js
const tx = await factory.createClone(...);
const receipt = await tx.wait();
const cloneAddress = receipt.logs[0].args.proxy;
```

---

### [3] 32바이트 정렬 오류

**원인:**

- `mstore(ptr, ...)`는 항상 32바이트 정렬됨
- Prefix(10 bytes) 이후 Impl(20 bytes)를 `ptr + 0x14`에 위치시킴
- Suffix는 `ptr + 0x28`에 위치시켜야 충돌 없음

**정리 흐름:**

```
ptr
├── 0x00: Prefix (32 bytes block 내 앞 10 bytes 사용)
├── 0x14: Impl (shl 로 0-padding 포함)
├── 0x28: Suffix 시작
```

---

## 🧠 디버깅 과정에서 얻은 인사이트

- bytecode 구조를 직접 디버깅할 때는 메모리 주소와 크기를 hex 기준으로 엄격히 이해해야 함
- EthersJS 사용 시, ABI 존재 여부가 매우 중요
- Minimal Proxy의 ABI-less 특성은 보안 및 가스비 측면에서 장점이지만 디버깅 복잡도 증가
