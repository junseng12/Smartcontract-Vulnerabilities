const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("👷 Deployer:", await deployer.getAddress());

  // 1. Implementation 컨트랙트 배포
  const Impl = await ethers.getContractFactory(
    "contracts/minimal-proxy/Implementation.sol:Implementation"
  );
  const impl = await Impl.deploy();
  await impl.waitForDeployment();
  console.log("✅ Implementation deployed:", await impl.getAddress());

  // 2. Factory 컨트랙트 배포
  const Factory = await ethers.getContractFactory("MinimalProxyFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  console.log("🏭 Factory deployed:", await factory.getAddress());

  // 3. 클론 생성 (주의: 트랜잭션 리턴됨!)
  const tx = await factory.createClone(await impl.getAddress());
  const receipt = await tx.wait();

  // 4. 이벤트 로그에서 clone 주소 추출
  const cloneAddress = receipt.logs[0].args.proxy;
  console.log("📦 Clone deployed at:", cloneAddress);

  // 5. clone 인터페이스로 연결
  const clone = await ethers.getContractAt(
    "contracts/minimal-proxy/Implementation.sol:Implementation",
    cloneAddress
  );

  // 6. clone 초기화
  await clone.initialize(await deployer.getAddress(), 123);
  console.log("🔧 Clone initialized");

  // 7. 상태 확인
  // clone은 minimal Proxy 이므로,(EVM 바이트 코드 자체) 일단 Proxy와 달리 개인 ABI없음
  // 따라서 직접 implement의 함수 호출 불가
  // const value = await clone.getValue();

  //clone은 Minimal Proxy라서 자체 ABI가 없음, 직접 ABI 수동 지정 필요
  // const implArtifact = await artifacts.readArtifact("Implementation");
  // const cloneInstance = new ethers.Contract(
  //   cloneAddress,
  //   implArtifact.abi,
  //   deployer
  // );
  // // console.log(Object.keys(cloneInstance.functions)); // 🔥 getValue 나와야 정상

  // const value = await cloneInstance.getValue(); // callStatic 없어도 정상 작동함
  const abi = ["function getValue() view returns (uint256)"];
  const cloneInstance = new ethers.Contract(cloneAddress, abi, deployer);

  // 1. 바이트코드 확인
  const bytecode = await ethers.provider.getCode(cloneAddress);
  console.log("🧬 Clone bytecode:", bytecode);

  // 💥 callStatic 쓰지 마, view 함수는 직접 호출 가능
  const value = await cloneInstance.getValue();
  console.log("✅ True clone value:", value.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
