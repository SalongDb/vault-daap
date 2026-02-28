# Backend – ETH Vault Smart Contract

This folder contains the Hardhat project for the ETH Vault smart contract.

## Setup

```bash
npm install
```

## Compile

```bash
npx hardhat compile
```

## Deploy (Sepolia)

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Verify

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```