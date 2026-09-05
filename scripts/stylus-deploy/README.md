# CertiVault — Windows-Native Arbitrum Stylus Deployment Tool

This directory provides a verified, native Windows deployment and validation suite for the CertiVault Arbitrum Stylus smart contract, operating without requiring WSL2, Docker, or Unix domain socket dependencies.

---

## 📋 Prerequisites

1. **Node.js**: `v20+` or `v25.8.0+`
2. **WASM Build**: Compiled WASM located at `../../target/wasm32-unknown-unknown/release/certivault.wasm`
3. **Arbitrum Sepolia Testnet ETH**: In the deployer wallet

---

## ⚙️ Setup

Install dependencies:
```powershell
cd scripts/stylus-deploy
npm install
```

---

## 🔍 Layer B: On-Chain Stylus Pre-Check (`check.js`)

Validates the compiled WASM binary, verifies Brotli compression, checks size limits, and performs on-chain ArbWasm validation against Arbitrum Sepolia.

```powershell
node check.js
# or
npm run check
```

---

## 🚀 Layer C: Deployment & Smoke Tests (`deploy.js`)

### 1. Set Environment Variables
In PowerShell:
```powershell
$env:PRIVATE_KEY = "0x<your_testnet_private_key>"
$env:DEPLOY_CONFIRM = "true"
```
*(Or create a local `.env` file containing `PRIVATE_KEY=...` and `DEPLOY_CONFIRM=true`. Note that `.env` is ignored by `.gitignore`)*.

### 2. Run Deployment
```powershell
node deploy.js
# or
npm run deploy
```

---

## 🔒 Security Guidelines

- **NEVER** commit your private key or `.env` file.
- **NEVER** use a mainnet private key for testnet deployments.
- All post-deployment smoke tests use **100% synthetic mock hashes**; no real academic data is ever submitted to the blockchain.
