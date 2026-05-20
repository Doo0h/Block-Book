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

    event StudentRegistered(address indexed student, string studentId, uint256 time);
    event TokenRewarded(address indexed student, uint256 amount, string eventName, uint256 balance, uint256 time);
    event TokenUsed(
        address indexed buyer,
        string bookId,
        uint256 tokenUsed,
        uint256 discountWon,
        uint256 finalPrice,
        uint256 time
    );
    event TokenPolicyChanged(uint256 newTokenValueWon, uint256 time);

    modifier onlyAdmin() {
        require(msg.sender == minter, "Only admin");
        _;
    }

    modifier onlyRegistered(address student) {
        require(students[student].registered, "Student is not registered");
        _;
    }

    constructor() {
        minter = msg.sender;
    }

    function registerStudent(address student, string memory studentId) external onlyAdmin {
        require(student != address(0), "Invalid student");
        require(!students[student].registered, "Student already registered");

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
        external
        onlyAdmin
        onlyRegistered(student)
    {
        require(amount > 0, "Amount must be greater than zero");

        balances[student] += amount;
        totalSupply += amount;
        students[student].totalEarned += amount;
        students[student].lastUpdated = block.timestamp;

        rewardCount++;
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
        require(bookPrice > 0, "Book price must be greater than zero");

        uint256 discount = tokenAmount * tokenValueWon;

        if (discount >= bookPrice) {
            return (bookPrice, 0);
        }

        return (discount, bookPrice - discount);
    }

    function spendToken(uint256 bookPrice, uint256 tokenAmount, string memory bookId)
        external
        onlyRegistered(msg.sender)
        returns (uint256 discountWon, uint256 finalPrice)
    {
        require(bookPrice > 0, "Book price must be greater than zero");
        require(tokenAmount > 0, "Token amount must be greater than zero");
        require(balances[msg.sender] >= tokenAmount, "Insufficient token balance");

        (uint256 discount, uint256 finalPriceAmount) = previewDiscount(bookPrice, tokenAmount);
        require(discount <= bookPrice, "Invalid discount");

        balances[msg.sender] -= tokenAmount;
        totalSupply -= tokenAmount;
        students[msg.sender].totalSpent += tokenAmount;
        students[msg.sender].lastUpdated = block.timestamp;

        purchaseCount++;
        purchaseHistory[purchaseCount] = PurchaseRecord({
            buyer: msg.sender,
            bookId: bookId,
            bookPrice: bookPrice,
            tokenUsed: tokenAmount,
            discountWon: discount,
            finalPrice: finalPriceAmount,
            createdAt: block.timestamp
        });

        emit TokenUsed(msg.sender, bookId, tokenAmount, discount, finalPriceAmount, block.timestamp);
        return (discount, finalPriceAmount);
    }

    function changeTokenValue(uint256 newTokenValueWon) external onlyAdmin {
        require(newTokenValueWon > 0, "Token value must be greater than zero");

        tokenValueWon = newTokenValueWon;
        emit TokenPolicyChanged(newTokenValueWon, block.timestamp);
    }

    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function getStudentInfo(address student)
        external
        view
        returns (bool registered, uint256 balance, uint256 totalEarned, uint256 totalSpent, uint256 lastUpdated)
    {
        Student memory item = students[student];
        return (item.registered, balances[student], item.totalEarned, item.totalSpent, item.lastUpdated);
    }
}
