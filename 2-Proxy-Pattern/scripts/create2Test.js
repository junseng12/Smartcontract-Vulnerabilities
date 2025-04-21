const { ethers } = require("hardhat");

async function main() {
  // 0. 배포자
  const [deployer] = await ethers.getSigners();
  console.log("👷 Deployer:", await deployer.getAddress());

  // 1. 로직 컨트랙트 배포
  const Impl = await ethers.getContractFactory(
    "contracts/create2-clone/Implementation.sol:Implementation"
  );
  const impl = await Impl.deploy();
  await impl.waitForDeployment();
  console.log("✅ Implementation deployed:", await impl.getAddress());

  // 2. Factory 배포
  const Factory = await ethers.getContractFactory("DeterministicFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  console.log("🏭 Factory deployed:", await factory.getAddress());

  // 3. 클론 주소 예측
  const salt = ethers.keccak256(
    ethers.toUtf8Bytes("junseung-" + new Date().getTime())
  );
  const predictedAddress = await factory.computeCloneAddress(
    await impl.getAddress(),
    salt
  );
  console.log("🔮 Predicted clone address:", predictedAddress);
  // const implCode = await ethers.provider.getCode(await impl.getAddress());
  // console.log("📦 Impl Bytecode:", implCode); // 이게 '0x'면 문제가 있음

  // 4. 클론 생성
  const tx = await factory.createClone(await impl.getAddress(), salt);
  const receipt = await tx.wait();
  const actualClone = receipt.logs[0].args.cloneAddress;
  console.log("📦 Clone deployed at:", actualClone);

  // 5. 클론 초기화
  //clone 주소와 로직 ABI(implementation 컨트랙트) 연결
  const clone = await ethers.getContractAt(
    "contracts/create2-clone/Implementation.sol:Implementation",
    actualClone
  );
  await clone.initialize(await deployer.getAddress(), 999);
  const code = await ethers.provider.getCode(actualClone);
  console.log("🧬 Clone bytecode:", code);
  const owner = await clone.owner();
  console.log("🧑 Owner after init:", owner);
  console.log("🔧 Clone initialized");

  // 6. 상태 확인
  const value = await clone.getValue();
  console.log("✅ Value (확인용):", value.toString());
  console.log("✅ Clone value:", value.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
