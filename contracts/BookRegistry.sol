// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookRegistry {
    address public admin;

    struct Book {
        string title;
        string author;
        string currentStatus;
        address currentOwner;
        uint256 lastPrice;
        uint256 lastUpdated;
        bool exists;
    }

    mapping(uint256 => Book) public books;
    mapping(address => bool) public operators;

    event BookRegistered(uint256 indexed bookId, address indexed owner, string title, string author, string status);
    event BookTransferred(uint256 indexed bookId, address indexed previousOwner, address indexed newOwner, uint256 price);
    event OperatorUpdated(address indexed operator, bool allowed);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyAdminOrOperator() {
        require(msg.sender == admin || operators[msg.sender], "Only admin or operator can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setOperator(address operator, bool allowed) external onlyAdmin {
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    function registerBook(uint256 id, string memory title, string memory author, string memory status) public {
        require(!books[id].exists, "Book already exists");
        require(bytes(title).length > 0, "Title cannot be empty");

        books[id] = Book({
            title: title,
            author: author,
            currentStatus: status,
            currentOwner: msg.sender,
            lastPrice: 0,
            lastUpdated: block.timestamp,
            exists: true
        });

        emit BookRegistered(id, msg.sender, title, author, status);
    }

    function transferBook(uint256 id, address newOwner, uint256 price, string memory status) external {
        require(books[id].exists, "Book does not exist");
        require(newOwner != address(0), "Invalid owner address");
        require(msg.sender == books[id].currentOwner || msg.sender == admin || operators[msg.sender], "Not authorized");

        address previousOwner = books[id].currentOwner;
        books[id].currentOwner = newOwner;
        books[id].currentStatus = status;
        books[id].lastPrice = price;
        books[id].lastUpdated = block.timestamp;

        emit BookTransferred(id, previousOwner, newOwner, price);
    }

    function addTradeHistory(uint256 id, address newOwner, uint256 price, string memory status) public onlyAdminOrOperator {
        require(books[id].exists, "Book does not exist");
        require(newOwner != address(0), "Invalid owner address");

        address previousOwner = books[id].currentOwner;
        books[id].currentOwner = newOwner;
        books[id].currentStatus = status;
        books[id].lastPrice = price;
        books[id].lastUpdated = block.timestamp;

        emit BookTransferred(id, previousOwner, newOwner, price);
    }
}
