const { ethers } = require("ethers");

const RPC_URL = "http://127.0.0.1:8545";

// Geth에 배포한 BOOKTOKEN AT 주소 넣기
const BOOK_TOKEN_ADDRESS = "여기에_BookToken_컨트랙트주소";

// Geth 계정 private key 넣기
const PLATFORM_PRIVATE_KEY = "여기에_private_key";

const STUDENT_ADDRESS = "0x969b611e8db92275cd681e1ec00740c5313f03fd";

const BOOK_TOKEN_ABI = [
  "function registerStudent(address _student, string _studentId) public",
  "function rewardToken(address _student, uint256 _amount, string _eventName) public",
  "function spendToken(uint256 _bookPrice, uint256 _tokenAmount, string _bookId) public",
  "function balances(address) public view returns (uint256)",
  "function previewDiscount(uint256 _bookPrice, uint256 _tokenAmount) public view returns (uint256,uint256)",
  "function getStudentInfo(address _student) public view returns (bool,uint256,uint256,uint256,uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PLATFORM_PRIVATE_KEY, provider);

  const contract = new ethers.Contract(
    BOOK_TOKEN_ADDRESS,
    BOOK_TOKEN_ABI,
    wallet
  );

  console.log("연결 지갑:", wallet.address);

  console.log("학생 등록 중...");
  const tx1 = await contract.registerStudent(STUDENT_ADDRESS, "2022810004");
  await tx1.wait();
  console.log("학생 등록 완료:", tx1.hash);

  console.log("보상 토큰 지급 중...");
  const tx2 = await contract.rewardToken(
    STUDENT_ADDRESS,
    30,
    "Blockchain Seminar QR Reward"
  );
  await tx2.wait();
  console.log("보상 지급 완료:", tx2.hash);

  const balance = await contract.balances(STUDENT_ADDRESS);
  console.log("현재 잔액:", balance.toString(), "BBT");

  const preview = await contract.previewDiscount(15000, 20);
  console.log("할인 금액:", preview[0].toString());
  console.log("최종 금액:", preview[1].toString());

  const info = await contract.getStudentInfo(STUDENT_ADDRESS);
  console.log("학생 등록 여부:", info[0]);
  console.log("잔액:", info[1].toString());
  console.log("총 획득:", info[2].toString());
  console.log("총 사용:", info[3].toString());
}

main().catch((error) => {
  console.error("테스트 실패:", error);
});