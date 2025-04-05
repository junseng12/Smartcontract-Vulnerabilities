const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", await deployer.getAddress());

  // 1. LogicV1 배포
  const LogicV1 = await ethers.getContractFactory("LogicV1");
  const logicV1 = await LogicV1.deploy();
  await logicV1.waitForDeployment();
  console.log("LogicV1 deployed at:", await logicV1.getAddress());

  // 2. Proxy 배포 (LogicV1 주소로 초기화)
  const Proxy = await ethers.getContractFactory("Proxy");
  const proxy = await Proxy.deploy(await logicV1.getAddress());
  await proxy.waitForDeployment();
  console.log("Proxy deployed at:", await proxy.getAddress());

  // 3. Proxy 주소로 LogicV1 인터페이스 연결
  const proxyAsLogicV1 = await ethers.getContractAt(
    "LogicV1",
    await proxy.getAddress()
  );

  // 4. Proxy를 통해 setVars 호출
  const tx1 = await proxyAsLogicV1.setVars(42);
  await tx1.wait();
  console.log("✅ Proxy through LogicV1.setVars(42) called");

  // 5. 상태 확인
  const [num1, sender1] = await proxyAsLogicV1.getVars();
  console.log("Proxy state - num:", num1.toString(), "sender:", sender1);

  // 6. LogicV2 배포
  const LogicV2 = await ethers.getContractFactory("LogicV2");
  const logicV2 = await LogicV2.deploy();
  await logicV2.waitForDeployment();
  console.log("LogicV2 deployed at:", await logicV2.getAddress());

  // 7. Proxy 업그레이드
  const upgradeTx = await proxy.upgrade(await logicV2.getAddress());
  await upgradeTx.wait();
  console.log("🔁 Proxy upgraded to LogicV2");

  // 8. Proxy 주소에 LogicV2 인터페이스 연결
  const proxyAsLogicV2 = await ethers.getContractAt(
    "LogicV2",
    await proxy.getAddress()
  );

  // 9. setVars 호출
  const tx2 = await proxyAsLogicV2.setVars(99);
  await tx2.wait();
  console.log("✅ Proxy through LogicV2.setVars(99) called");

  // 10. 상태 확인
  const [num2, sender2, version] = await proxyAsLogicV2.getVars();
  console.log(
    "Proxy state - num:",
    num2.toString(),
    "sender:",
    sender2,
    "version:",
    version
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
