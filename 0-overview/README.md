# 📚 Blockchain Security: Location-based Conceptual Summary

Blockchain is an artificial system that works in cooperation with various aspects, not technology.
Security also involves various elements related to relationships, and understanding each part is necessary to establish an overall security strategy.

---

## 🧱 Blockchain 7-layer structure and examples

| Cons | Explanation | Major examples |
|------|------|------|
| **Application section** | User and block combination UI, Web3, API | XSS, injection, front-learning |
| **Contract Cons** | Smart track equilibrium location | Reentrancy, delegated call, access control error |
| **Computation section** | EVM or WASM state transition handling | Gas limit issue, state maintenance, VM existence error |
| **Consensus section** | Block generation/confirmation structure, PoS, BFT, etc. | Communication with blockchain |
| **Data section** | Block/transaction storage structure | If an error occurs, refer to the block |
| **Network location** | Police station, Police station | MEV, Processor sniffing, Delay attack |
| **Inside** | Actual work, RPC server, Work | Key theft, Operation execution, RPC operation |

---

This structure is structured so that you can **understand structurally whether the pointer can match any location** rather than actually experimenting.

"""

# 🔁 Reentrancy Special

Reentrancy is a **certification** that reentry occurs again in the same call during an external call in smart contract tracking and **processes the state**.

## 1️⃣ Understanding the concept
- When there is an external call, the structure is re-called again before the call is completed
- Representative: The DAO (2016)

## 2️⃣ Code analysis
`Vulnerable.sol` is designed to change the state after an external call, so it's annoying.

## 3️⃣ Attacked
Using the fallback() function in `AttackReentrancy.sol`, reentrancy is performed and funds are repeatedly withdrawn.

## 4️⃣ Action
- Process state changes first, then external calls
- Use a structure like `nonReentrant` (OpenZeppelin ReentrancyGuard)

All code is verified by processing `/contracts`, and can be tested via Hardhat.
"""
