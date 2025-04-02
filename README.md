# 📚 Blockchain Security: Location-based Conceptual Summary

Blockchain is an artificial system that works in cooperation with various aspects, not technology.
Security also involves various elements related to relationships, and understanding each part is necessary to establish an overall security strategy.

---

## 🧱 Blockchain 7-layer structure and examples

| Cons                    | Explanation                                             | Major examples                                         |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| **Application section** | User and block combination UI, Web3, API                | XSS, injection, front-learning                         |
| **Contract Cons**       | Smart track equilibrium location                        | Reentrancy, delegated call, access control error       |
| **Computation section** | EVM or WASM state transition handling                   | Gas limit issue, state maintenance, VM existence error |
| **Consensus section**   | Block generation/confirmation structure, PoS, BFT, etc. | Communication with blockchain                          |
| **Data section**        | Block/transaction storage structure                     | If an error occurs, refer to the block                 |
| **Network location**    | Police station, Police station                          | MEV, Processor sniffing, Delay attack                  |
| **Inside**              | Actual work, RPC server, Work                           | Key theft, Operation execution, RPC operation          |

---

This structure is structured so that you can **understand structurally whether the pointer can match any location** rather than actually experimenting.

---

# 🚧 Upcoming Vulnerability Practices & Learning Goals

This repository aims to **systematically analyze and simulate smart contract vulnerabilities**.  
For each topic, we follow a structured process:

1. **🧠 Concept Understanding**  
   Grasp the vulnerability’s theoretical and practical aspects  
   → attack flow, affected patterns, real-world examples

2. **🔍 Code Analysis**  
   Understand vulnerable code structures and critical mistakes

3. **🧪 Exploit Simulation**  
   Perform hands-on attack using Hardhat test environment

4. **🛡️ Mitigation Techniques**  
   Discuss prevention methods (design patterns, libraries, etc.)

---

## 🔓 Planned Topics (to be updated)

| Vulnerability              | Status       |
| -------------------------- | ------------ |
| Reentrancy                 | ✅ Completed |
| Delegatecall Abuse         | 🔜 Planned   |
| Denial of Service          | 🔜 Planned   |
| Access Control Flaws       | 🔜 Planned   |
| Integer Overflow/Underflow | 🔜 Planned   |
| tx.origin Pitfall          | 🔜 Planned   |

Each vulnerability will be explored in a **dedicated subdirectory** within `/contracts/`.

> 📂 Example: `contracts/delegatecall`, `contracts/access-control`

Stay tuned for ongoing updates! 🚀
