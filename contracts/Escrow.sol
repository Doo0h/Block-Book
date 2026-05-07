// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BookEscrow {
    // 거래 상태 열거형
    enum EscrowState { 
        Locked,    // 거래 금액 예치 완료 (에스크로 Lock)
        Completed, // 구매자 수령 확인 및 정산 완료
        Canceled   // 거래 취소 및 환불
    }

    struct Transaction {
        address payable buyer;
        address payable seller;
        uint256 amount;
        EscrowState state;
    }

    // 거래 ID(예: 주문 번호)에 따른 거래 정보
    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;

    // 프론트엔드 연동을 위한 이벤트
    event EscrowLocked(uint256 txId, address buyer, address seller, uint256 amount);
    event DeliveryConfirmed(uint256 txId);
    event TransactionCanceled(uint256 txId);

    // 1. 에스크로 예치 (구매자가 금액과 함께 호출)
    function createAndLockTransaction(address payable _seller) public payable {
        require(msg.value > 0, "Amount must be greater than zero");

        transactionCount++;
        uint256 txId = transactionCount;

        transactions[txId] = Transaction({
            buyer: payable(msg.sender),
            seller: _seller,
            amount: msg.value,
            state: EscrowState.Locked
        });

        emit EscrowLocked(txId, msg.sender, _seller, msg.value);
    }

    // 2. 도서 전달 확인 (구매자가 호출 시 판매자에게 송금)
    function confirmDeliveryAndPay(uint256 _txId) public {
        Transaction storage txn = transactions[_txId];
        
        require(msg.sender == txn.buyer, "Only buyer can confirm delivery");
        require(txn.state == EscrowState.Locked, "Transaction is not locked");

        txn.state = EscrowState.Completed;
        
        // 판매자에게 금액 전송
        txn.seller.transfer(txn.amount);

        emit DeliveryConfirmed(_txId);
    }

    // 3. 거래 취소 및 환불 (판매자 또는 구매자 호출)
    function cancelTransaction(uint256 _txId) public {
        Transaction storage txn = transactions[_txId];
        
        require(msg.sender == txn.buyer || msg.sender == txn.seller, "Not authorized");
        require(txn.state == EscrowState.Locked, "Transaction is not locked");

        txn.state = EscrowState.Canceled;

        // 구매자에게 금액 환불
        txn.buyer.transfer(txn.amount);

        emit TransactionCanceled(_txId);
    }
}
