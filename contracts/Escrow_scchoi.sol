// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 중고 도서 거래 대금을 스마트 컨트랙트에 예치하고 구매 확정 시 판매자에게 송금하는 에스크로 컨트랙트
contract BookEscrow {
    // 에스크로 거래 상태를 나타내는 열거형
    enum EscrowState {
        None,       // 거래가 생성되지 않은 상태
        Locked,     // 구매자가 대금을 예치한 상태
        Completed,  // 구매 확정 후 판매자에게 대금이 지급된 상태
        Canceled    // 거래가 취소되어 구매자에게 환불된 상태
    }

    // 하나의 에스크로 거래 정보를 저장하는 구조체
    struct EscrowTrade {
        // 구매자 주소
        address payable buyer;
        // 판매자 주소
        address payable seller;
        // 컨트랙트에 예치된 실제 결제 금액
        uint256 amount;
        // 할인에 사용한 보상 토큰 수량
        uint256 tokenUsed;
        // 토큰 사용으로 할인된 금액
        uint256 discountAmount;
        // 현재 거래 상태
        EscrowState state;
    }

    // 거래 ID를 기준으로 에스크로 거래 정보를 저장하는 매핑
    mapping(uint256 => EscrowTrade) public trades;

    // 일반 결제로 거래 대금이 예치되었을 때 발생하는 이벤트
    event EscrowLocked(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount);

    // 토큰 할인을 적용한 거래 대금이 예치되었을 때 발생하는 이벤트
    event EscrowLockedWithDiscount(
        uint256 indexed tradeId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 tokenUsed,
        uint256 discountAmount
    );

    // 구매자가 도서 수령을 확정하여 판매자에게 대금이 지급되었을 때 발생하는 이벤트
    event DeliveryConfirmed(uint256 indexed tradeId, address indexed seller, uint256 amount);

    // 거래가 취소되었을 때 발생하는 이벤트
    event TransactionCanceled(uint256 indexed tradeId);

    // 구매자가 거래 대금을 컨트랙트에 예치하는 함수
    function lockFunds(uint256 tradeId, address payable seller) external payable returns (bool) {
        // 할인 없이 거래 대금을 예치
        _lock(tradeId, seller, 0, 0);

        // 예치 완료 이벤트 발생
        emit EscrowLocked(tradeId, msg.sender, seller, msg.value);
        return true;
    }

    // 보상 토큰 할인을 적용하여 거래 대금을 컨트랙트에 예치하는 함수
    function lockFundsWithDiscount(
        uint256 tradeId,
        address payable seller,
        uint256 tokenUsed,
        uint256 discountAmount
    ) external payable returns (bool) {
        // 사용한 토큰 수량과 할인 금액을 함께 저장하며 거래 대금을 예치
        _lock(tradeId, seller, tokenUsed, discountAmount);

        // 할인 적용 예치 완료 이벤트 발생
        emit EscrowLockedWithDiscount(tradeId, msg.sender, seller, msg.value, tokenUsed, discountAmount);
        return true;
    }

    // 구매자가 도서 수령을 확인하고 판매자에게 대금을 지급하는 함수
    function confirmDelivery(uint256 tradeId) external returns (bool) {
        // 거래 ID에 해당하는 에스크로 정보를 가져옴
        EscrowTrade storage trade = trades[tradeId];

        // 대금이 예치된 거래만 구매 확정 가능
        require(trade.state == EscrowState.Locked, "Trade is not locked");

        // 구매자 본인만 수령 확인 가능
        require(msg.sender == trade.buyer, "Only buyer can confirm delivery");

        // 거래 상태를 완료로 변경한 뒤 판매자에게 예치금 송금
        trade.state = EscrowState.Completed;
        trade.seller.transfer(trade.amount);

        // 구매 확정 이벤트 발생
        emit DeliveryConfirmed(tradeId, trade.seller, trade.amount);
        return true;
    }

    // 거래 완료 여부를 확인하는 함수
    function releaseFunds(uint256 tradeId) external returns (bool) {
        // 이미 완료된 거래인지 확인
        require(trades[tradeId].state == EscrowState.Completed, "Trade is not completed");
        return true;
    }

    // 구매자 또는 판매자가 거래를 취소하고 구매자에게 환불하는 함수
    function cancelTransaction(uint256 tradeId) external returns (bool) {
        // 거래 ID에 해당하는 에스크로 정보를 가져옴
        EscrowTrade storage trade = trades[tradeId];

        // 대금이 예치된 거래만 취소 가능
        require(trade.state == EscrowState.Locked, "Trade is not locked");

        // 구매자 또는 판매자만 거래 취소 가능
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Not authorized");

        // 거래 상태를 취소로 변경한 뒤 구매자에게 예치금 환불
        trade.state = EscrowState.Canceled;
        trade.buyer.transfer(trade.amount);

        // 거래 취소 이벤트 발생
        emit TransactionCanceled(tradeId);
        return true;
    }

    // 실제 예치 로직을 처리하는 내부 함수
    function _lock(uint256 tradeId, address payable seller, uint256 tokenUsed, uint256 discountAmount) private {
        // 거래 ID는 0보다 커야 함
        require(tradeId > 0, "Invalid trade id");

        // 판매자 주소가 0번 주소가 아닌지 확인
        require(seller != address(0), "Invalid seller");

        // 예치 금액은 0보다 커야 함
        require(msg.value > 0, "Amount must be greater than zero");

        // 동일한 거래 ID로 중복 예치할 수 없음
        require(trades[tradeId].state == EscrowState.None, "Trade already exists");

        // 새로운 에스크로 거래 정보를 저장하고 상태를 Locked로 설정
        trades[tradeId] = EscrowTrade({
            buyer: payable(msg.sender),
            seller: seller,
            amount: msg.value,
            tokenUsed: tokenUsed,
            discountAmount: discountAmount,
            state: EscrowState.Locked
        });
    }
}
