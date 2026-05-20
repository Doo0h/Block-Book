// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BookEscrow {
    enum EscrowState {
        None,
        Locked,
        Completed,
        Canceled
    }

    struct EscrowTrade {
        address payable buyer;
        address payable seller;
        uint256 amount;
        uint256 tokenUsed;
        uint256 discountAmount;
        EscrowState state;
    }

    mapping(uint256 => EscrowTrade) public trades;

    event EscrowLocked(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount);
    event EscrowLockedWithDiscount(
        uint256 indexed tradeId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 tokenUsed,
        uint256 discountAmount
    );
    event DeliveryConfirmed(uint256 indexed tradeId, address indexed seller, uint256 amount);
    event TransactionCanceled(uint256 indexed tradeId);

    function lockFunds(uint256 tradeId, address payable seller) external payable returns (bool) {
        _lock(tradeId, seller, 0, 0);
        emit EscrowLocked(tradeId, msg.sender, seller, msg.value);
        return true;
    }

    function lockFundsWithDiscount(
        uint256 tradeId,
        address payable seller,
        uint256 tokenUsed,
        uint256 discountAmount
    ) external payable returns (bool) {
        _lock(tradeId, seller, tokenUsed, discountAmount);
        emit EscrowLockedWithDiscount(tradeId, msg.sender, seller, msg.value, tokenUsed, discountAmount);
        return true;
    }

    function confirmDelivery(uint256 tradeId) external returns (bool) {
        EscrowTrade storage trade = trades[tradeId];

        require(trade.state == EscrowState.Locked, "Trade is not locked");
        require(msg.sender == trade.buyer, "Only buyer can confirm delivery");

        trade.state = EscrowState.Completed;
        trade.seller.transfer(trade.amount);

        emit DeliveryConfirmed(tradeId, trade.seller, trade.amount);
        return true;
    }

    function releaseFunds(uint256 tradeId) external returns (bool) {
        require(trades[tradeId].state == EscrowState.Completed, "Trade is not completed");
        return true;
    }

    function cancelTransaction(uint256 tradeId) external returns (bool) {
        EscrowTrade storage trade = trades[tradeId];

        require(trade.state == EscrowState.Locked, "Trade is not locked");
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Not authorized");

        trade.state = EscrowState.Canceled;
        trade.buyer.transfer(trade.amount);

        emit TransactionCanceled(tradeId);
        return true;
    }

    function _lock(uint256 tradeId, address payable seller, uint256 tokenUsed, uint256 discountAmount) private {
        require(tradeId > 0, "Invalid trade id");
        require(seller != address(0), "Invalid seller");
        require(msg.value > 0, "Amount must be greater than zero");
        require(trades[tradeId].state == EscrowState.None, "Trade already exists");

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
