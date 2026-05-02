pragma solidity ^0.4.24;

contract BookRegistry {
    address public admin;

    struct Book {
        string title;
        string author;
        string currentStatus;
        address currentOwner;
        uint lastPrice;
        uint lastUpdated;
        bool exists;
    }

    struct BookHistory {
        address owner;
        uint price;
        string status;
        uint timestamp;
    }

    mapping(uint => Book) public books;
    mapping(uint => BookHistory[]) private bookHistories;

    event BookRegistered(
        uint indexed bookId,
        string title,
        string author,
        string status,
        address indexed owner
    );

    event BookHistoryAdded(
        uint indexed bookId,
        address indexed owner,
        uint price,
        string status,
        uint timestamp
    );

    constructor() public {
        admin = msg.sender;
    }

    function registerBook(
        uint _id,
        string _title,
        string _author,
        string _status
    ) public {
        require(!books[_id].exists);

        books[_id] = Book(
            _title,
            _author,
            _status,
            msg.sender,
            0,
            now,
            true
        );

        bookHistories[_id].push(BookHistory(msg.sender, 0, _status, now));

        emit BookRegistered(_id, _title, _author, _status, msg.sender);
    }

    function addTradeHistory(
        uint _id,
        address _newOwner,
        uint _price,
        string _status
    ) public {
        require(books[_id].exists);
        require(_newOwner != address(0));

        books[_id].currentOwner = _newOwner;
        books[_id].currentStatus = _status;
        books[_id].lastPrice = _price;
        books[_id].lastUpdated = now;

        bookHistories[_id].push(BookHistory(_newOwner, _price, _status, now));

        emit BookHistoryAdded(_id, _newOwner, _price, _status, now);
    }

    function getHistoryCount(uint _id) public view returns (uint) {
        return bookHistories[_id].length;
    }

    function getHistory(
        uint _id,
        uint _index
    )
        public
        view
        returns (
            address owner,
            uint price,
            string status,
            uint timestamp
        )
    {
        require(_index < bookHistories[_id].length);

        BookHistory storage history = bookHistories[_id][_index];
        return (
            history.owner,
            history.price,
            history.status,
            history.timestamp
        );
    }
}
