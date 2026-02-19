// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Vault {
    mapping (address => uint) balance;
    address public owner;

    event Deposit(address indexed sender, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);

    constructor(){
        owner = msg.sender;
    }

    function deposit() public payable{
        require(msg.value > 0, "Send some ETH");
        emit Deposit(msg.sender,msg.value);
    }

    function withdraw(uint256 amount) public{
        require(msg.sender == owner, "Not the owner");
        require(address(this).balance >= amount,"Insufficient balance");

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success,"Transfer failed");

        emit Withdraw(owner, amount);
    }

    function getBlance() public view returns(uint256) {
        return address(this).balance;
    }
}