// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookRegistry {
    address public admin;

    // 도서 정보를 담는 구조체
    struct Book {
        string title;
        string author;
        string currentStatus;
        address currentOwner;
        uint lastPrice;
        uint lastUpdated;
        bool exists;
    }

    // 도서 ID별 정보를 저장하는 매핑 
    mapping(uint => Book) public books;

    // 관리자만 실행 가능하도록 제한 
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // 1. 사용자가 직접 도서 정보를 등록하는 함수
    function registerBook(
        uint _id,
        string memory _title,
        string memory _author,
        string memory _status
    ) public {
        require(!books[_id].exists, "Book already exists");
        require(bytes(_title).length > 0, "Title cannot be empty");

        books[_id] = Book(
            _title,
            _author,
            _status,
            msg.sender,
            0,
            block.timestamp,
            true
        );
    }

    // 2. 거래 완료 후 플랫폼 관리자가 거래 이력(소유자 변경)을 추가하는 함수
    function addTradeHistory(
        uint _id,
        address _newOwner,
        uint _price,
        string memory _status
    ) public onlyAdmin {
        require(books[_id].exists, "Book does not exist");
        require(_newOwner != address(0), "Invalid owner address");

        books[_id].currentOwner = _newOwner;
        books[_id].currentStatus = _status;
        books[_id].lastPrice = _price;
        books[_id].lastUpdated = block.timestamp;
    }
}