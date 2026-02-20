// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Vault {

     // Tracks user deposit amount and last deposit time
    struct UserDepoInfo {
        uint depoAmount;
        uint depoTime;
    }

    mapping(address => UserDepoInfo) public depoInfo;

    address public owner;
    uint public feeBalance; // Accumulated 2% withdrawal fees
    bool public pause = false;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);
    event Fees(address indexed receiver, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Identity denied");
        _;
    }

    // Deposit resets the 7-day lock timer
    function deposit() public payable {
        require(msg.value > 0, "Send some ETH");

        UserDepoInfo storage user = depoInfo[msg.sender];

        user.depoAmount += msg.value;
        user.depoTime = block.timestamp;

        emit Deposit(msg.sender, msg.value);
    }

    // Withdraw after 7 days with 2% fee
    function withdraw(uint256 amount) public {
        require(!pause, "Withdrawals are paused");

        UserDepoInfo storage user = depoInfo[msg.sender];

        require(amount <= user.depoAmount, "Insufficient balance");
        require(
            block.timestamp >= user.depoTime + 7 days,
            "7 days not completed"
        );

        uint256 withdrawFee = (amount * 2) / 100;
        uint256 mainAmount = amount - withdrawFee;

        user.depoAmount -= amount;
        feeBalance += withdrawFee;

        (bool success, ) = payable(msg.sender).call{value: mainAmount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, mainAmount);
    }

    // Owner withdraws only accumulated fees
    function feeWithdraw(uint256 amount) public onlyOwner {
        require(amount <= feeBalance, "Insufficient balance");

        feeBalance -= amount;

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");

        emit Fees(owner, amount);
    }

    function pauseWithdraw() public onlyOwner {
        require(!pause,"Already paused");
        pause = true;
    }

    function unpauseWithdraw() public onlyOwner {
        require(pause,"Not paused");
        pause = false;
    }
}
