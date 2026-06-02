// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookToken {
    address public minter;

    string public tokenName = "BlockBook Reward Token";
    string public tokenSymbol = "BBT";

    uint256 public tokenValueWon = 100;
    uint256 public totalSupply;
    uint256 public rewardCount;
    uint256 public purchaseCount;

    struct Student {
        bool registered;
        string studentId;
        uint256 totalEarned;
        uint256 totalSpent;
        uint256 lastUpdated;
    }

    struct RewardRecord {
        address student;
        uint256 amount;
        string eventName;
        uint256 createdAt;
    }

    struct PurchaseRecord {
        address buyer;
        string bookId;
        uint256 bookPrice;
        uint256 tokenUsed;
        uint256 discountWon;
        uint256 finalPrice;
        uint256 createdAt;
    }

    mapping(address => uint256) public balances;
    mapping(address => Student) public students;
    mapping(uint256 => RewardRecord) public rewardHistory;
    mapping(uint256 => PurchaseRecord) public purchaseHistory;

    event StudentRegistered(address student, string studentId, uint256 time);
    event TokenRewarded(address student, uint256 amount, string eventName, uint256 balance, uint256 time);
    event TokenUsed(
        address buyer,
        string bookId,
        uint256 tokenUsed,
        uint256 discountWon,
        uint256 finalPrice,
        uint256 time
    );
    event TokenPolicyChanged(uint256 newTokenValueWon, uint256 time);

    modifier onlyAdmin() {
        require(msg.sender == minter, "Only admin can call this function.");
        _;
    }

    modifier onlyRegistered(address student) {
        require(students[student].registered, "Student is not registered.");
        _;
    }

    constructor() {
        minter = msg.sender;
    }

    function registerStudent(address student, string memory studentId) public onlyAdmin {
        require(student != address(0), "Student address is required.");
        require(!students[student].registered, "Student is already registered.");

        students[student] = Student({
            registered: true,
            studentId: studentId,
            totalEarned: 0,
            totalSpent: 0,
            lastUpdated: block.timestamp
        });

        emit StudentRegistered(student, studentId, block.timestamp);
    }

    function rewardToken(address student, uint256 amount, string memory eventName)
        public
        onlyAdmin
        onlyRegistered(student)
    {
        require(amount > 0, "Reward amount must be greater than zero.");

        balances[student] += amount;
        totalSupply += amount;

        students[student].totalEarned += amount;
        students[student].lastUpdated = block.timestamp;

        rewardCount += 1;
        rewardHistory[rewardCount] = RewardRecord({
            student: student,
            amount: amount,
            eventName: eventName,
            createdAt: block.timestamp
        });

        emit TokenRewarded(student, amount, eventName, balances[student], block.timestamp);
    }

    function previewDiscount(uint256 bookPrice, uint256 tokenAmount)
        public
        view
        returns (uint256 discountWon, uint256 finalPrice)
    {
        require(bookPrice > 0, "Book price must be greater than zero.");

        uint256 discount = tokenAmount * tokenValueWon;

        if (discount >= bookPrice) {
            return (bookPrice, 0);
        }

        return (discount, bookPrice - discount);
    }

    function spendToken(uint256 bookPrice, uint256 tokenAmount, string memory bookId)
        public
        onlyRegistered(msg.sender)
    {
        require(bookPrice > 0, "Book price must be greater than zero.");
        require(tokenAmount > 0, "Token amount must be greater than zero.");
        require(balances[msg.sender] >= tokenAmount, "Insufficient token balance.");

        (uint256 discountWon, uint256 finalPrice) = previewDiscount(bookPrice, tokenAmount);
        require(discountWon <= bookPrice, "Discount cannot exceed book price.");

        balances[msg.sender] -= tokenAmount;
        totalSupply -= tokenAmount;

        students[msg.sender].totalSpent += tokenAmount;
        students[msg.sender].lastUpdated = block.timestamp;

        purchaseCount += 1;
        purchaseHistory[purchaseCount] = PurchaseRecord({
            buyer: msg.sender,
            bookId: bookId,
            bookPrice: bookPrice,
            tokenUsed: tokenAmount,
            discountWon: discountWon,
            finalPrice: finalPrice,
            createdAt: block.timestamp
        });

        emit TokenUsed(msg.sender, bookId, tokenAmount, discountWon, finalPrice, block.timestamp);
    }

    function changeTokenValue(uint256 newTokenValueWon) public onlyAdmin {
        require(newTokenValueWon > 0, "Token value must be greater than zero.");

        tokenValueWon = newTokenValueWon;

        emit TokenPolicyChanged(newTokenValueWon, block.timestamp);
    }

    function getMyBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function getStudentInfo(address student)
        public
        view
        returns (
            bool registered,
            uint256 balance,
            uint256 totalEarned,
            uint256 totalSpent,
            uint256 lastUpdated
        )
    {
        Student memory info = students[student];

        return (
            info.registered,
            balances[student],
            info.totalEarned,
            info.totalSpent,
            info.lastUpdated
        );
    }
}
