// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 도서 등록, 소유권 변경, 거래 이력 관리를 담당하는 스마트 컨트랙트
contract BookRegistry {
    // 컨트랙트 관리자 주소
    address public admin;

    // 도서 기본 정보와 최근 거래 상태를 저장하는 구조체
    struct Book {
        // 도서 제목
        string title;
        // 도서 저자
        string author;
        // 현재 도서 상태(예: 양호, 필기 있음, 파손 있음 등)
        string currentStatus;
        // 현재 도서 소유자 주소
        address currentOwner;
        // 마지막 거래 가격
        uint256 lastPrice;
        // 마지막 정보 수정 시간
        uint256 lastUpdated;
        // 도서 ID 등록 여부 확인 값
        bool exists;
    }

    // 도서 ID를 기준으로 도서 정보를 저장하는 매핑
    mapping(uint256 => Book) public books;

    // 관리자 외에 도서 이력을 수정할 수 있는 운영자 주소를 저장하는 매핑
    mapping(address => bool) public operators;

    // 새로운 도서가 등록되었을 때 발생하는 이벤트
    event BookRegistered(uint256 indexed bookId, address indexed owner, string title, string author, string status);

    // 도서 소유권이 변경되거나 거래 이력이 추가되었을 때 발생하는 이벤트
    event BookTransferred(uint256 indexed bookId, address indexed previousOwner, address indexed newOwner, uint256 price);

    // 운영자 권한이 변경되었을 때 발생하는 이벤트
    event OperatorUpdated(address indexed operator, bool allowed);

    // 관리자만 함수를 호출할 수 있도록 제한하는 modifier
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // 관리자 또는 등록된 운영자만 함수를 호출할 수 있도록 제한하는 modifier
    modifier onlyAdminOrOperator() {
        require(msg.sender == admin || operators[msg.sender], "Only admin or operator can call this function");
        _;
    }

    // 컨트랙트를 배포한 주소를 관리자로 설정
    constructor() {
        admin = msg.sender;
    }

    // 운영자 계정을 추가하거나 제거하는 함수
    function setOperator(address operator, bool allowed) external onlyAdmin {
        operators[operator] = allowed;
        emit OperatorUpdated(operator, allowed);
    }

    // 고유한 도서 ID로 새로운 도서를 등록하는 함수
    function registerBook(uint256 id, string memory title, string memory author, string memory status) public {
        // 이미 등록된 도서 ID는 다시 등록할 수 없음
        require(!books[id].exists, "Book already exists");

        // 도서 제목은 반드시 입력해야 함
        require(bytes(title).length > 0, "Title cannot be empty");

        // 입력받은 도서 정보를 books 매핑에 저장
        books[id] = Book({
            title: title,
            author: author,
            currentStatus: status,
            currentOwner: msg.sender,
            lastPrice: 0,
            lastUpdated: block.timestamp,
            exists: true
        });

        // 외부 애플리케이션에서 도서 등록 사실을 확인할 수 있도록 이벤트 발생
        emit BookRegistered(id, msg.sender, title, author, status);
    }

    // 도서 소유권을 새로운 소유자에게 이전하고 거래 정보를 갱신하는 함수
    function transferBook(uint256 id, address newOwner, uint256 price, string memory status) external {
        // 등록된 도서인지 확인
        require(books[id].exists, "Book does not exist");

        // 새 소유자 주소가 0번 주소가 아닌지 확인
        require(newOwner != address(0), "Invalid owner address");

        // 현재 소유자, 관리자, 운영자만 소유권을 이전할 수 있음
        require(msg.sender == books[id].currentOwner || msg.sender == admin || operators[msg.sender], "Not authorized");

        // 기존 소유자를 저장한 뒤 소유자, 상태, 가격, 수정 시간을 갱신
        address previousOwner = books[id].currentOwner;
        books[id].currentOwner = newOwner;
        books[id].currentStatus = status;
        books[id].lastPrice = price;
        books[id].lastUpdated = block.timestamp;

        // 외부 애플리케이션에서 소유권 이전 사실을 확인할 수 있도록 이벤트 발생
        emit BookTransferred(id, previousOwner, newOwner, price);
    }

    // 관리자 또는 운영자가 도서 거래 이력을 추가하는 함수
    function addTradeHistory(uint256 id, address newOwner, uint256 price, string memory status) public onlyAdminOrOperator {
        // 등록된 도서인지 확인
        require(books[id].exists, "Book does not exist");

        // 새 소유자 주소가 0번 주소가 아닌지 확인
        require(newOwner != address(0), "Invalid owner address");

        // 거래 이력에 따라 현재 소유자와 최근 거래 정보를 갱신
        address previousOwner = books[id].currentOwner;
        books[id].currentOwner = newOwner;
        books[id].currentStatus = status;
        books[id].lastPrice = price;
        books[id].lastUpdated = block.timestamp;

        // 외부 애플리케이션에서 거래 이력 추가 사실을 확인할 수 있도록 이벤트 발생
        emit BookTransferred(id, previousOwner, newOwner, price);
    }
}
