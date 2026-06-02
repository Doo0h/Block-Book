pragma solidity ^0.4.24;

contract BookToken {
    address public minter;

    string public tokenName = "BlockBook Reward Token";
    string public tokenSymbol = "BBT";

    // 1 토큰당 할인 금액. 예: 1 BBT = 100원 할인
    uint public tokenValueWon = 100;

    uint public totalSupply;
    uint public rewardCount;
    uint public purchaseCount;

    struct Student {
        bool registered;
        string studentId;
        uint totalEarned;
        uint totalSpent;
        uint lastUpdated;
    }

    struct RewardRecord {
        address student;
        uint amount;
        string eventName;
        uint createdAt;
    }

    struct PurchaseRecord {
        address buyer;
        string bookId;
        uint bookPrice;
        uint tokenUsed;
        uint discountWon;
        uint finalPrice;
        uint createdAt;
    }

    // 학생 주소별 토큰 잔액 저장
    mapping(address => uint) public balances;

    // 학생 주소별 등록 정보 저장
    mapping(address => Student) public students;

    // 보상 지급 내역 저장
    mapping(uint => RewardRecord) public rewardHistory;

    // 도서 구매 시 토큰 사용 내역 저장
    mapping(uint => PurchaseRecord) public purchaseHistory;

    event StudentRegistered(address student, string studentId, uint time);
    event TokenRewarded(address student, uint amount, string eventName, uint balance, uint time);
    event TokenUsed(address buyer, string bookId, uint tokenUsed, uint discountWon, uint finalPrice, uint time);
    event TokenPolicyChanged(uint newTokenValueWon, uint time);

    modifier onlyAdmin() {
        require(msg.sender == minter);
        _;
    }

    modifier onlyRegistered(address _student) {
        require(students[_student].registered == true);
        _;
    }

    constructor() public {
        minter = msg.sender;
    }

    // 학생 등록
    function registerStudent(address _student, string _studentId) public onlyAdmin {
        require(_student != address(0));
        require(students[_student].registered == false);

        students[_student].registered = true;
        students[_student].studentId = _studentId;
        students[_student].totalEarned = 0;
        students[_student].totalSpent = 0;
        students[_student].lastUpdated = now;

        emit StudentRegistered(_student, _studentId, now);
    }

    // 행사 참여 보상 지급
    // 예: QR 인증이 완료된 학생에게 관리자가 토큰 지급
    function rewardToken(address _student, uint _amount, string _eventName)
        public
        onlyAdmin
        onlyRegistered(_student)
    {
        require(_amount > 0);

        // Solidity 0.4.24는 자동 오버플로우 검사가 없으므로 간단한 검증 추가
        require(balances[_student] + _amount >= balances[_student]);
        require(totalSupply + _amount >= totalSupply);

        balances[_student] += _amount;
        totalSupply += _amount;

        students[_student].totalEarned += _amount;
        students[_student].lastUpdated = now;

        rewardCount++;

        rewardHistory[rewardCount].student = _student;
        rewardHistory[rewardCount].amount = _amount;
        rewardHistory[rewardCount].eventName = _eventName;
        rewardHistory[rewardCount].createdAt = now;

        emit TokenRewarded(_student, _amount, _eventName, balances[_student], now);
    }

    // 도서 구매 전 예상 할인 금액 확인
    function previewDiscount(uint _bookPrice, uint _tokenAmount)
        public
        view
        returns (uint discountWon, uint finalPrice)
    {
        require(_bookPrice > 0);

        uint discount = _tokenAmount * tokenValueWon;

        if (_tokenAmount > 0) {
            require(discount / _tokenAmount == tokenValueWon);
        }

        if (discount >= _bookPrice) {
            return (_bookPrice, 0);
        }

        return (discount, _bookPrice - discount);
    }

    // 도서 구매 시 토큰 사용
    function spendToken(uint _bookPrice, uint _tokenAmount, string _bookId)
        public
        onlyRegistered(msg.sender)
    {
        require(_bookPrice > 0);
        require(_tokenAmount > 0);
        require(balances[msg.sender] >= _tokenAmount);

        uint discount = _tokenAmount * tokenValueWon;

        // 오버플로우 방지
        require(discount / _tokenAmount == tokenValueWon);

        // 할인 금액이 책 가격을 넘지 않도록 제한
        require(discount <= _bookPrice);

        uint finalPrice = _bookPrice - discount;

        balances[msg.sender] -= _tokenAmount;

        // 사용한 토큰은 재사용되지 않도록 소각 처리
        totalSupply -= _tokenAmount;

        students[msg.sender].totalSpent += _tokenAmount;
        students[msg.sender].lastUpdated = now;

        purchaseCount++;

        purchaseHistory[purchaseCount].buyer = msg.sender;
        purchaseHistory[purchaseCount].bookId = _bookId;
        purchaseHistory[purchaseCount].bookPrice = _bookPrice;
        purchaseHistory[purchaseCount].tokenUsed = _tokenAmount;
        purchaseHistory[purchaseCount].discountWon = discount;
        purchaseHistory[purchaseCount].finalPrice = finalPrice;
        purchaseHistory[purchaseCount].createdAt = now;

        emit TokenUsed(msg.sender, _bookId, _tokenAmount, discount, finalPrice, now);
    }

    // 관리자만 토큰 할인 정책 변경 가능
    function changeTokenValue(uint _newTokenValueWon) public onlyAdmin {
        require(_newTokenValueWon > 0);

        tokenValueWon = _newTokenValueWon;

        emit TokenPolicyChanged(_newTokenValueWon, now);
    }

    // 내 토큰 잔액 확인
    function getMyBalance() public view returns (uint) {
        return balances[msg.sender];
    }

    // 특정 학생의 토큰 정보 확인
    function getStudentInfo(address _student)
        public
        view
        returns (
            bool registered,
            uint balance,
            uint totalEarned,
            uint totalSpent,
            uint lastUpdated
        )
    {
        return (
            students[_student].registered,
            balances[_student],
            students[_student].totalEarned,
            students[_student].totalSpent,
            students[_student].lastUpdated
        );
    }
}